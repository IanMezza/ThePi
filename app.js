/*
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var app = express();
var mysql = require('mysql');
var fecha = new Date();
var gpio = require("gpio");
var gpio22, gpio21, intervalTimer, intervalTimer2;
var twitter = require('ntwitter')
/*
 * Se declaran algunas variables globales para la lógica
 * de la aplicación.
 */
var carga = new Array();
carga[0] = 0;
carga[1] = 0;

var twit = new twitter({
    consumer_key: 'Wu3Ztet4FN240Kzzu0Eow',
    consumer_secret: 'i5ecmTQVFAVvlewlKB08Wm2z6V4DHPPUszHmEeBMz04',
    access_token_key: '24846645-L7RiyboD7VRUPgcGXHTxUKELo4ACL8YFCwpWnL0cj',
    access_token_secret: 'GvJkYZQuma7DixOaug9QBEBneaHrW8Ex8m9ipatBGY'
});

/*
 * Todos los ambientes
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err, req, res, next) {
    console.error(err, stack);
    res.send(500, 'Algo no funciona');
});

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}
/*
 * Rutas del sitio
 */
app.get('/', routes.sirvePagina);
app.use(function(req, res, next) {
    res.send(404, 'Lo sentimos, no existe la pagina!');
});
/*
 *Se crea el objeto Servidor HTTP y se asigna a la variable servidor
 */
var servidor = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
/*
 * Se vincula la variable de socket 'io' al servidor http recien creado
 * 'servidor'
 */
io = require('socket.io').listen(servidor);
io.set('log level', 1);
/*
 *Se manejarán espacios de nombres (namespaces) distintos para multiplexar el
 *Websocket permitiéndo así separar la comunicacion de control y el streamiming
 *de datos en tiempo real
 */

iniciaPines();


/*
 * Aqui va el socket de control (botones y forms)
 */
var control = io.of('/control').on('connection', function(socket) {
    // Se monitorean los cambios en el GPIO y se actualizan las cargas
    gpio22.on("change", function(val) {
       actualizaCargas(socket, carga);
    });
    gpio27.on("change", function(val) {
       actualizaCargas(socket, carga);
    });

    socket.emit('controlConectado');
    actualizaCargas(socket, carga);
    socket.on('clienteControl', function() {
        //iniciaPines();
        //console.log(gpio22.value);
    });

    /*
     * Cada que se activa o desactiva una carga se recibe el comando a través de
     * socket.IO y se procesa a través de la función switchBandera()
     */
    socket.on('actualizaCarga', function(nCarga, onOff) {
        carga[nCarga] = switchBandera(nCarga, onOff);
    });
    socket.on('enviaCadena', function(cadena){
        insertaUsuario(cadena);    
    });
    socket.on('consultaUnMes', function(yearConsulta, mesConsulta) {
        //console.log(typeof yearConsulta);
        //console.log(typeof mesConsulta);
        recuperaUnMes(socket, yearConsulta, mesConsulta);
    });
});
/*
 * Socket de streaming de datos en tiempo real(medidor o grafica en vivo)
 */
var stream = io.of('/stream').on('connection', function(socket) {
    socket.emit('streamConectado');
    socket.on('solicitaGrafica', function() {
        recuperaActual(socket);
    });
    socket.on('solicitaAnos', function() {
        recuperaListaAnos(socket);
    });
    socket.on('solicitaMeses', function(year) {
        //console.log(year);
        recuperaListaMeses(socket, year);
    });
    socket.on('solicitaGraficaMes', function(yearConsulta, mesConsulta) {
        //console.log(yearConsulta);
        //console.log(mesConsulta);
        recuperaListaMeses(socket, yearConsulta);
    });
});

//Iniciamos la conexión vía Twitter para recibir comandos de ON/OF
twit.stream('statuses/filter', {'follow': ['24846645']}, function(stream) {
    stream.on('data', function(data) {
        data.entities.hashtags.map(function(hashtag) {
            console.log(data.user.screen_name + ' : ' + hashtag.text);
            if (hashtag.text === 'GPION') {
                carga[0] = switchBandera(0, 1);
                //actualizaCargas(socket, carga);
            }
            else if (hashtag.text === 'GPIOFF') {
                carga[0] = switchBandera(0, 0);
                //actualizaCargas(socket, carga);
            }
        });
    });
});


/*
 * Declaración de las funciones y definición para posible reutilización de
 * código
 */

/*
 * Cambia el valor del parámetro Bandera dentro del rango 0-1.
 * @param {int} n
 * @param {int} onOff
 * @returns {Number}
 */
function switchBandera(n, onOff) {
    if (carga[n] === 1 && onOff === 0) {
        carga[n] = 0;
        apagaPin(n);
    }
        
    else if (carga[n] === 0 && onOff === 1) {
        carga[n] = 1;
        enciendePin(n);
    }
        
    else
        console.log('algunError');
    return carga[n];
}

/*
 * Emite el evento actualiza y pasa como argumento el estado del arreglo carga
 * @param {type} socket
 * @param {type} carga
 * @returns {undefined}
 */
function actualizaCargas(socket, carga) {
    socket.emit('actualiza', carga);
}

/*
 * Crea el cliente MySQL y se conecta con el servidor MySQL
 */
function conectaMySQL() {
    var client = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'whatthefuck'
    });
    return client;
}

/*
 * Hace una consulta de todos los elementos de la tabla de prueba
 */
function recuperaTodo(socket) {
    cliente = conectaMySQL();
    cliente.query('USE consumo');
    cliente.query('SELECT * FROM registro', function(err, results) {
        enviaDatos(err, results, socket);
        //console.log(results[45].fecha);
    });
}

/*
 * Hace una consulta de todos los elementos desde inicio del mas actual hasta la fecha actual
 */
function recuperaActual(socket) {
    var fecha = new Date();
    //console.log(fecha);
    var mesActual = fecha.getMonth()-2;// -1 para recuperar los datos del mes de abril.
    var fechaInicio = '2014-03-01'//String(fecha.getFullYear() + '-' + String(mesActual) +'-' + '01');
    var fechaActual = '2014-03-30'//String(fecha.getFullYear() + '-' + String(mesActual) +'-' + String(fecha.getDate()));
    //console.log(fechaInicio);
    //console.log(fechaActual);
    cliente = conectaMySQL();
    cliente.query('USE consumo');
    cliente.query('SELECT * FROM registro WHERE fecha >= \'' + fechaInicio + '\' AND fecha <= \'' + fechaActual + '\'', function(err, results) { //FIXME
        //console.log(results.length);
       // console.log(results[results.length - 1].fecha);
        enviaDatos(err, results, socket, 'resultadosGrafica');
        return results;
    });
    
}
/*
 * Hace una consulta de los elementos de la tabla dentro del periodo acotado por
 * comienzo y fin.
 * @param {type} socket
 * @returns {undefined}
 */
function recuperaPeriodo(socket) {
    var comienzo = '2014-03-01';
    var fin = '2014-03-23';
    cliente = conectaMySQL();
    cliente.query('USE consumo');
    cliente.query('SELECT * FROM registro WHERE fecha >= \'' + comienzo + '\' AND fecha <= \'' + fin + '\'', function(err, results) {
        enviaDatos(err, results, socket);
        console.log(results);
    });
}
/*
 * Recibe el resultado de la seleccion y lo envia al cliente a traves del socket
 */
function enviaDatos(err, results, socket, evento) {
    if (err) {
        console.log('Error: ' + err.message);
        throw err;
    }
    socket.emit(evento, results);
}
/*
 *Recibe el argumento nombre y lo inserta como nombre de usuario dentro de la
 *base de datos
 */
function insertaUsuario(nombre) {
    cliente = conectaMySQL();
    cliente.query('USE consumo');
    cliente.query('INSERT INTO consumo.persona (nombre, hora) VALUES (\'' + nombre + '\', CURRENT_TIME)');
}

/*
 *Esta función recupera la lista de los meses en función del año de consulta.
 *@socket {socket.io} socket de comunicación.
 *@yearConsulta {string} Año de consulta.
 */
function recuperaListaMeses(socket, yearConsulta) {
    var inicio = yearConsulta+'-01-01';
    var fin = yearConsulta+'-12-31';
    //console.log(inicio);
    cliente = conectaMySQL();
    cliente.query('USE consumo');
    cliente.query('SELECT EXTRACT(MONTH FROM fecha) AS meses FROM registro WHERE fecha >= \'' + inicio + '\' AND fecha <= \'' + fin + '\' GROUP BY meses', function(err, results) {
        //console.log(results);
        enviaDatos(err, results, socket, 'resultadosMeses');
    });
}

/*
 *Función que recupera la lista de los años registrados en la base de datos.
 */
function recuperaListaAnos(socket) {
    //console.log('entramos a recuperaAnos');
    cliente = conectaMySQL();
    cliente.query('USE consumo');
    cliente.query('SELECT EXTRACT(YEAR FROM fecha) AS years FROM registro GROUP BY years', function(err, results) {
        //console.log(results);
        enviaDatos(err, results, socket, 'resultadosAnos');
    });
}

function recuperaUnMes (socket, yearConsulta, mesConsulta) {
    var inicio = yearConsulta+'-'+mesConsulta+'-01';
    var fin = yearConsulta+'-'+mesConsulta+'-31';
    console.log(inicio);
    console.log(fin);
}

//EN RASPBERRY PI Rev 2 GPIO 21 -> GPIO 27

function iniciaPines() {
    gpio22 = gpio.export(22, {
        ready: function() {
            console.log('Pin 22, listo!');
        }
    });
    gpio27 = gpio.export(27, {
        ready: function() {
            console.log('Pin 27, listo!');
        }
    });
}

function enciendePin (n) {
    switch (n) {
        case 0:
        intervalTimer = setInterval(function() {
            gpio22.set();
        }, 100);
        break;
        case 1:
        intervalTimer2 = setInterval(function() {
            gpio27.set();
        }, 100);
        break;
    }    
}

function apagaPin(n) {
    switch(n) {
        case 0:
        setTimeout(function() {
            clearInterval(intervalTimer);
            gpio22.reset();
        }, 100)
                             
        break;

        case 1:
        setTimeout(function() {
                    clearInterval(intervalTimer2);
                    gpio27.reset();
                }, 100);
        break;
    }  
}