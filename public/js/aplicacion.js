/*Esta sera la aplicacion principal de la interfaz de usuario*/
/*Primero se establece la comunicación con el servidor Node.js
y se verfica el correcto funcionamiento de los sockets.*/

// TODO Fijar la IP
var socketControl = io.connect('http://192.168.1.67:3000/control');
var socketStream = io.connect('http://192.168.1.67:3000/stream');

socketControl.on('nuevoTwitt', function(usuario, hashtag) {
    console.log(usuario, hashtag);
});

socketControl.on('Tweets', function(results) {
    //console.log(results);
    recibeTweets(results);
});




/*
 * CONTROL DE CARGAS
 */
$('#on1').click(function () {
    actualizaCargas(0, 1);
    console.log('On1');
});

$('#off1').click(function () {
    actualizaCargas(0, 0);
    console.log('Off1');
});
$('#on2').click(function () {
    actualizaCargas(1, 1);
    console.log('On2');
});
$('#off2').click(function () {
    actualizaCargas(1, 0);
    console.log('Off2');
});
/*
 ****************************
 */

$('#consultaUnMes').click(function() {
    socketControl.emit('consultaUnMes', yearConsulta, mesCosnulta);
});

/*
 * MANEJO DE FORMS
 */
$('#enviaCadena').click(function () {
    console.log('Mandaste datos');
    cadena = $('#exampleInputEmail1').val();
    enviaCadena(cadena);
});
/*
 ****************************
 */



socketControl.on('controlConectado', function () {
    socketControl.emit('clienteControl');
});

socketControl.on('actualiza', function (carga) {
    if (carga[0] === 1) {
        $('#alertaOff1').hide();
        $('#alertaOn1').show();
    } else {
        $('#alertaOn1').hide();
        $('#alertaOff1').show();
        $('#alertaOff1').removeClass('hidden');
    }
    if (carga[1] === 1) {
        $('#alertaOff2').hide();
        $('#alertaOn2').show();
    } else {
        $('#alertaOn2').hide();
        $('#alertaOff2').show();
        $('#alertaOff2').removeClass('hidden');
    }
});

/*
 * MEDIDOR EN TIEMPO REAL
 */

var c = $('#medidorGrafica');
var ct = c.get(0).getContext('2d');
var ctx = document.getElementById("medidorGrafica").getContext("2d");

//This will get the first returned node in the jQuery collection.
var myNewChart = new Chart(ctx);
var lectura = {
    value: 75,
    color: "#F7464A"
};
var restante = {
    value: 25,
    color: "#E2EAE9"
};
var data = [lectura, restante];
var options = {
    animation: false,
    percentageInnerCutout: 50
};
new Chart(ctx).Doughnut(data, options);
$('#lectura').text(lectura.value + ' KwH');

$("#hola").click(function () {
    lectura.value = lectura.value + 1;
    restante.value = restante.value - 1;
    //data = [lectura, restante];
    new Chart(ctx).Doughnut(data, options);
    $('#lectura').text(lectura.value + ' KwH');
    console.log(data[0].value);
});


/*
 ************************************************
 */


/*
 * GRAFICA DEL COMPORTAMIENTO DE CONSUMO
 */
 var fecha = new Date();
 var meses = new Array();
 meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
 var mes = fecha.getMonth();
 var year = fecha.getFullYear();
 var titulo = meses[mes];
 var subtitulo = year;
 var yearConsulta, mesCosnulta, diaConsulta;

socketStream.emit('solicitaGrafica');

socketStream.on('resultadosGrafica', function (results) {
    generaGrafica(results, titulo, subtitulo);
});
socketStream.emit('solicitaAnos');
socketStream.on('resultadosAnos', function (results) {
    recibeListaAnos(results);
});

socketStream.on('resultadosMeses', function (results) {
    recibeListaMeses(results);
});

/*
 * Función para las listas dinámicas. 
 */
$(document).on("click", '[title="Haz click"]', function() {
    $('#mensual').empty();
    var lista = $(this).closest('ul').attr('id'); //Obtiene el ID de la lista 'madre'
    var tmp = $(this).text();
    var input;
    if (lista == 'anual') {
        yearConsulta = tmp;
        mesCosnulta = '';
        input = '#inputAno';
        $('#botonMeses').removeAttr('disabled');
        socketStream.emit('solicitaMeses', tmp);
    }
    else {
        mesCosnulta = tmp;
        input = '#inputMes';
        console.log(yearConsulta);
        console.log(mesCosnulta);
        socketStream.emit('solicitaGraficaMes', yearConsulta, mesCosnulta);
    }
    $(input).val(tmp);
    
});
/*
 ************************************************
 */

function actualizaCargas(nCarga, onOff) {
    socketControl.emit('actualizaCarga', nCarga, onOff);
}

function enviaCadena(cadena) {
    socketControl.emit('enviaCadena', cadena);
}

function generaGrafica(resultados, titulo, subtitulo) {
    var temp = resultados;
    var i;
    var ejeY = new Array();
    var ejeX = new Array();
    for (i = 0; i < temp.length; i++) {
        ejeY[i] = temp[i].lectura;
        ejeX[i] = temp[i].fecha.slice(8,10);
    }
    $('#graficaConsumo').highcharts({
        title: {
            text: titulo,
            x: -20
        },
        subtitle: {
            text: subtitulo,
            x: -20
        },
        xAxis: {
            type: 'datetime',
            categories: ejeX
        },
        yAxis: {
            title: {
                text: 'Energia electrica'
            },
            plotlines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' KWh'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'KwH',
            data: ejeY
        }]
    });
}

function recibeListaAnos(resultados) {
    var $ulLista;
    $ulLista = $('#listaAnos').find('ul');
    for (var i = resultados.length - 1; i >= 0; i--) {
        var $liNuevoItem = $('<li/>').html('<a href="#" title="Haz click" id='+String(resultados[i].years)+'>'+resultados[i].years+'</a>');
        $ulLista.append($liNuevoItem);
    };
}

function recibeListaMeses(resultados) {
    var $ulLista;
    $ulLista = $('#listaMeses').find('ul');
    for (var i = 0; i <= resultados.length - 1; i++) {
        var $liNuevoItem = $('<li/>').html('<a href="#" title="Haz click">'+meses[resultados[i].meses-1]+'</a>');
        $ulLista.append($liNuevoItem);
    };
}


function recibeTweets(resultados) {
    var $ulLista;
    $ulLista = $('#listaTweets').find('ul');
    for (var i = resultados.length - 5; i <= resultados.length - 1; i++) {  // Solo los ultimos 5 tweets
        var $liNuevoItem = $('<li class="list-group-item"/>').html(resultados[i].hora+' '+resultados[i].usuario+' '+resultados[i].tweet);
        $ulLista.append($liNuevoItem);
    };
}
//FUNCION LISTA



//La tabla para el consumo de la base de datos debe contener: Fecha[AAAA,MM,DD], HORA, LECTURA