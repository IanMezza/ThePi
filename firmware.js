// LEDES => 13, 12, 11, 10, 9, 8, 7 (RELEVADOR)
module.exports = function(pinEmitter, sensor, insertaLectura) {
    var five = require("johnny-five"),
        sp = require("serialport");

    var board;//, port;
    /*
    port = new sp.SerialPort("/dev/ttyACM0", {
        baudrate: 57600, // No other boud rate works
        buffersize: 128 // Firmata uses 1
    });
    */
    board = new five.Board({
       // port: port
    });

    board.on("ready", function() {
        // var led_13 = new five.Led(13);
        // var led_12 = new five.Led(12);
        // var led_11 = new five.Led(11);
        // var led_10 = new five.Led(10);
        // var led_9 = new five.Led(9);
        // var led_8 = new five.Led(8);
        // var led_7 = new five.Led(7);
        var muestras = 0;
        var lectura, lecturaCuadrada;
        var suma = 0;
        var corrienteRMS = 0;
        var voltsRMS = 120;
        var watts = 0;
        var kWh = 0;
        var potentiometer = new five.Sensor({
            pin: 'A0',
            freq: 125 //500 Hz    ~ 6% de perdidas en el muestreo
        });
        board.repl.inject({
            pot: potentiometer,
            // led_7 : led_7,
            // led_8 : led_8,
            // led_9 : led_9,
            // led_10 : led_10,
            // led_11 : led_11,
            // led_11 : led_11,
            // led_12 : led_12,
            // led_12 : led_12,
            // led_13 : led_13
        });
        pinEmitter.on('setPin', function(pinN, onOff) {
            if (onOff === 1) (new five.Led(pinN)).on();
            else (new five.Led(pinN)).off();
        });
        //(new five.Led(13)).strobe();

        potentiometer.scale([0, 4]).on("data", function() {
            lectura = this.value;
            sensor.emit('lectura', lectura * voltsRMS);
            muestras = muestras + 1;
            if (muestras > 8) {
                muestras = 0;
                insertaLectura(lectura * voltsRMS / 1000);
            }
            /*  QUITAR COMENTARIO PARA TRABAJAR CON CORRIENTE ALTERNA
            if (muestras < 500) { // SE CALCULA LA CORRIENTE RMS CADA SEGUNDO CON 480 MUESTRAS
                // Se eleva al cuadrado cada lectura
                lecturaCuadrada = Math.pow(lectura, 2);
                // Se hace arrastre de suma
                suma = suma + lecturaCuadrada;
                muestras = muestras+1;
                console.log(muestras);
            }
            else if (muestras >= 500) {
                // Se eleva al cuadrado cada lectura
                lecturaCuadrada = Math.pow(lectura, 2);
                // Se hace arrastre de suma
                suma = suma + lecturaCuadrada;
                // Se divide entre el numero de muestras y se calcula la raiz cuadrada de la suma
                corrienteRMS = Math.sqrt(suma/muestras);
                watts = corrienteRMS * voltsRMS;
                kWh = watts * 0.001;// / 3600;
                sensor.emit('lectura', watts);
                insertaLectura(kWh);
                suma = 0;
                muestras = 0;
            }  */
        });

    // led_8.strobe(500);
    // led_9.strobe(500);
    // led_10.strobe(500);
    // led_11.strobe(500);
    // led_12.strobe(500);
    // led_13.strobe(500);

    });
}
