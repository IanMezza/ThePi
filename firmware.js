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
            pot: potentiometer
        });
        pinEmitter.on('setPin', function(n) {
            (new five.Led(n)).strobe();
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
    });
}
