/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function generaGrafica(resultados, titulo, subtitulo) {
                console.log('entramos a la funcion');
                var temp = resultados;
                var i;
                var ejeY = new Array();
                var ejeX = new Array();
                for (i = 0; i < temp.length; i++) {
                    ejeY[i] = temp[i].valor;
                    ejeX[i] = temp[i].hora;
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
                            text: 'Electricidad'
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
                            name: 'Prueba',
                            data: ejeY
                        }]
                });
            }
