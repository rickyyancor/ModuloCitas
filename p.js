socket.on('crear_cita',function(data) {
  PDFDocument = require('pdfkit');
  doc = new PDFDocument
  fs = require('fs');
  doc.pipe(fs.createWriteStream('html/Reportes/C'+cliente+".pdf"))

  var Base_de_Datos_linea= new Conexion_BD(Configuracion_Base);
  Base_de_Datos_linea.on('connect', function(err)
  {
    if (err) {console.log(err);}
    else
    {
        //console.log("Exito al conectar");

        var cadena ="exec @linea = sp_Expdiente_linea @anio, @correlativo,0";

            request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                }
                Base_de_Datos_linea.close();
                var Base_de_Datos= new Conexion_BD(Configuracion_Base);
                Base_de_Datos.on('connect', function(err)
                {
                  if (err) {console.log(err);}
                  else
                  {
                      //console.log("Exito al conectar");

                      var cadena ="exec sp_cita_ingreso @anio, @correlativo, @servicio, @unidad, @fecha, @linea, @ip, @id_doctor, @hora,0";

                          request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                              }
                              Base_de_Datos.close();
                              for(var i=0;i<data.linea;i++)
                                doc.moveDown();
                              doc.fontSize(9).text(data.fecha+"-"+data.hora+"-"+data.nombre_servicio+"-"+data.nombre_unidad+"-"+data.nombre_medico);
                              doc.end()
                              console.log("Creacion de cita exitosa desde el cliente: "+cliente)
                              socket.emit('cita_exitosa','/Reportes/C'+cliente+".pdf");

                          });//fin del request

                          request.on('doneProc',function (rowCount, more, rows) {

                              //console.log("El procedimiento ha terminado ");
                          });
                          request.on('row',function(columns) {
                              var id=columns[0].value.toString();

                          });
                          request.addParameter('anio',TYPES.Int,data.no_expediente.substring(0, 4));
                          request.addParameter('correlativo',TYPES.Int,data.no_expediente.substring(4, 11));
                          request.addParameter('servicio',TYPES.Int,data.servicio);
                          request.addParameter('unidad',TYPES.Int,data.unidad);
                          request.addParameter('fecha',TYPES.Date,data.fecha);
                          request.addParameter('linea',TYPES.Int,data.linea);
                          request.addParameter('ip',TYPES.VarChar,cliente);
                          request.addParameter('id_doctor',TYPES.Int,data.id_doctor);
                          request.addParameter('hora',TYPES.VarChar,data.hora);


                          Base_de_Datos.execSql(request);

                  }
                });//fin de connect
                Base_de_Datos.on('error',function(err) {
                  console.log("se ha llamado a la funcion error :  \n"+err);
                  Base_de_Datos= new Conexion_BD(Configuracion_Base);
                });


            });//fin del request

            request.on('doneProc',function (rowCount, more, rows) {

                //console.log("El procedimiento ha terminado ");
            });
            request.on('row',function(columns) {
                data.linea=columns[0].value.toString();

            });
            request.on('returnValue', function(parameterName, value, metadata) {
              //console.log(parameterName + ' = ' + value);
              data.linea=value;
              console.log("La linea que toca es "+data.linea)
            });
            request.addParameter('anio',TYPES.Int,data.no_expediente.substring(0, 4));
            request.addParameter('correlativo',TYPES.Int,data.no_expediente.substring(4, 11));
            request.addOutputParameter('linea',TYPES.Int);

            Base_de_Datos_linea.execSql(request);

    }
  });//fin de connect
  Base_de_Datos_linea.on('error',function(err) {
    console.log("se ha llamado a la funcion error :  \n"+err);
    Base_de_Datos= new Conexion_BD(Configuracion_Base);
  });

});//final de on crear cita
