var socketControl = io.connect('http://localhost:3000/control');
var socketStream = io.connect('http://localhost:3000/stream');


$('#opcion1').click(function() {
    actualizaCargas(0, 1);
});
$('#opcion2').click(function() {
    actualizaCargas(0, 0);
});
$('#opcion3').click(function() {
    actualizaCargas(1, 1);
});
$('#opcion4').click(function() {
    actualizaCargas(1, 0);
});
$('#enviaCadena').click(function() {
    console.log('Mandaste datos');
    cadena = $('#exampleInputEmail1').val();
    enviaCadena(cadena);
});


socketControl.on('controlConectado', function() {
    socketControl.emit('clienteControl');
});

socketControl.on('actualiza', function(carga) {
    if (carga[0] === 1) {
        $('#off1').hide();
        $('#on1').show();
    }
    else {
        $('#on1').hide();
        $('#off1').show();
        $('#off1').removeClass('hidden');
    }
    if (carga[1] === 1) {
        $('#off2').hide();
        $('#on2').show();
    }
    else {
        $('#on2').hide();
        $('#off2').show();
        $('#off2').removeClass('hidden');
    }
});
function actualizaCargas(nCarga, onOff) {
    socketControl.emit('actualizaCarga', nCarga, onOff);
}
function enviaCadena(cadena) {
    socketControl.emit('enviaCadena', cadena);
}