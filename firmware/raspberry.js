// Agregar este modulo para trabajar en el Raspbeery Pi como servidor.

//EN RASPBERRY PI Rev 2 GPIO 21 -> GPIO 27

var gpio = require("gpio");
var gpio22, gpio21, intervalTimer, intervalTimer2;

exports.iniciaPines = function() {
	gpio22 = gpio.export(22, {
	    ready: function() {
	        //console.log('Pin 22, listo!');
	    }
	});
	gpio27 = gpio.export(27, {
	    ready: function() {
	        //console.log('Pin 27, listo!');
	    }
	});
}


exports.enciendePin =function(n) {
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

exports.apagaPin = function(n) {
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

exports.huboCambio = function(actualizaCargas, socket, carga) {
	gpio22.on("change", function(val) {
        //carga[0] = 0;
	       actualizaCargas(socket, carga);
	    });
	gpio27.on("change", function(val) {
	       actualizaCargas(socket, carga);
	    });
}