/*Esta sera la aplicacion principal de la interfaz de usuario*/

/*Primero se establece la comunicación con el servidor Node.js
y se verfica el correcto funcionamiento de los sockets.*/

// TODO Fijar la IP
var socketControl = io.connect('http://192.168.1.71:3000/control');
var socketStream = io.connect('http://192.168.1.71:3000/stream');

socketControl.on('nuevoTwitt', function (usuario, hashtag) {
    console.log(usuario, hashtag);
});

socketControl.on('Tweets', function(results) {
    recibeTweets(results);
});

socketControl.on('facturas', function (results) {
    //console.log(results);
    recibeFacturas(results);
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

$('#pin13on').click(function () {
    setPines(13, 1);
});

$('#pin12on').click(function () {
    setPines(12, 1);
});

$('#pin11on').click(function () {
    setPines(11, 1);
});

$('#pin10on').click(function () {
    setPines(10, 1);
});

$('#pin9on').click(function () {
    setPines(9, 1);
});

$('#pin8on').click(function () {
    setPines(8, 1);
});

$('#pin7on').click(function () {
    setPines(7, 1);
});

$('#pin13off').click(function () {
    setPines(13, 0);
});

$('#pin12off').click(function () {
    setPines(12, 0);
});

$('#pin11off').click(function () {
    setPines(11, 0);
});

$('#pin10off').click(function () {
    setPines(10, 0);
});

$('#pin9off').click(function () {
    setPines(9, 0);
});

$('#pin8off').click(function () {
    setPines(8, 0);
});

$('#pin7off').click(function () {
    setPines(7, 0);
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

socketStream.on('sensor', function(lectura) {
    //console.log(lectura);
    var myNewChart = new Chart(ctx);
    var actual = {
        value: lectura,
        color: "#F7464A"
    };
    var restante = {
        value: 480-lectura,
        color: "#E2EAE9"
    };
    var data = [actual, restante];
    var options = {
        animation: false,
        percentageInnerCutout: 50
    };
    new Chart(ctx).Doughnut(data, options);
    $('#lectura').text(actual.value.toFixed(2) + ' W/h');
     console.log(actual.value + ' kWh');
    // console.log(typeof actual.value);
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
 var mesActual = meses[mes];
 var subtitulo = year;
 var yearConsulta, mesCosnulta, diaConsulta;
 var ConsumoTotalActual = 0;

socketStream.emit('solicitaGrafica');

socketStream.on('resultadosGrafica', function (results) {
    generaGrafica(results);
});

socketStream.on('ConsumoTotalActual', function (results) {
    ConsumoTotalActual = results[0].Consumo_total_mensual;
    ActualizaConsumo(ConsumoTotalActual);
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
        //mesCosnulta = '';
        input = '#inputAno';
        $('#botonMeses').removeAttr('disabled');
        socketStream.emit('solicitaMeses', yearConsulta);
    }
    else {
        mesCosnulta = tmp;
        input = '#inputMes';
        // console.log(yearConsulta);
        // console.log(mesCosnulta);
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

function setPines(pinN, onOff) {
    socketControl.emit('setPin', pinN, onOff);
}

function enviaCadena(cadena) {
    socketControl.emit('enviaCadena', cadena);
}

function generaGrafica(resultados) {
    titulo = meses[parseInt(resultados[0].FECHA.slice(5,7)) - 1];
    subtitulo = resultados[0].FECHA.slice(0,4);

    var temp = resultados;
    var i;
    var ejeY = new Array();
    var ejeX = new Array();
    for (i = 0; i < temp.length; i++) {
        ejeY[i] = temp[i].Consumo_total;
        ejeX[i] = temp[i].FECHA.slice(8,10);
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
    }
}

function recibeListaMeses(resultados) {
    var $ulLista;
    $ulLista = $('#listaMeses').find('ul');
    for (var i = 0; i <= resultados.length - 1; i++) {
        var $liNuevoItem = $('<li/>').html('<a href="#" title="Haz click">'+meses[resultados[i].meses-1]+'</a>');
        $ulLista.append($liNuevoItem);
    }
}


function recibeTweets(resultados) {
    var $ulLista;
    $ulLista = $('#listaTweets').find('ul');
    for (var i = resultados.length - 5; i <= resultados.length - 1; i++) {  // Solo los ultimos 5 tweets
        var $liNuevoItem = $('<li class="list-group-item"/>').html(resultados[i].hora+' '+resultados[i].usuario+' '+resultados[i].tweet);
        $ulLista.append($liNuevoItem);
    }
}

function ActualizaConsumo(ConsumoTotalActual) {
    var cuenta = calcPagoActual(ConsumoTotalActual);
    console.log(ConsumoTotalActual);
    console.log(mesActual);
    $('#MesActual').text(mesActual);
    $('#ConsumoTotal').text(ConsumoTotalActual.toString().concat(' kWh'));
    $('#pagoAprox').text(cuenta.toFixed(2).concat(' pesos'));
}

function calcPagoActual (ConsumoTotalActual) {
    var pago = 0;
    var consumoBasico = 0;
    var consumoIntermedio = 0;
    var consumoExcedente = 0;
    /*  Verificar tarifas de CFE (Tarifa 1 2015) 
     *  Consumo básico      $ 0.809 por cada uno de los primeros 75 (setenta y cinco) kilowatts-hora.
     *  Consumo intermedio  $ 0.976 por cada uno de los siguientes 65 (sesenta y cinco) kilowatts-hora.
     *  Consumo excedente   $ 2.859 por cada kilowatt-hora adicional a los anteriores.
     */
    if (ConsumoTotalActual > 75) {
        consumoBasico = 75;
        consumoIntermedio  = ConsumoTotalActual - consumoBasico;
        if (consumoIntermedio > 65) {
            consumoIntermedio = 65;
            consumoExcedente = ConsumoTotalActual - (consumoBasico + consumoIntermedio);
        }
        console.log('Consumo básico ', consumoBasico);
        console.log('Consumo intermedio ', consumoIntermedio);
        console.log('Consumo excedente', consumoExcedente);
    }
    else {
        consumoBasico = ConsumoTotalActual;
        console.log('Consumo básico ', consumoBasico);
        console.log('Consumo intermedio ', consumoIntermedio);
        console.log('Consumo excedente', consumoExcedente);
    }
    if (consumoBasico < 25) {
        pago = 25 * 0.809;
        console.log('Su pago, gracias ', pago);
    } else{
        pago = consumoBasico * 0.809 + consumoIntermedio * 0.976 + consumoExcedente * 2.859;
        console.log('Su pago, gracias ', pago);
    }
    return pago;
}

function recibeFacturas(resultados) {
    var $ulLista;
    $ulLista = $('#listaFacturas').find('ul');
    for (var i = resultados.length - 5; i <= resultados.length - 1; i++) {  // Solo las ultimas 5 facturas
        var $liNuevoItem = $('<li class="list-group-item"/>').html('Fecha: '+resultados[i].fecha.slice(0, 10)+' Consumo: '+resultados[i].consumo+'kwH Pago: $'+resultados[i].pago);
        $ulLista.append($liNuevoItem);
    }
}

















