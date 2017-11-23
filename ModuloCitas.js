var Configuracion_Servidor= require("./ipconfig.json");
var port = process.env.PORT || Configuracion_Servidor.puerto;

var express = require('express');
var app = express();
fs = require('fs');
var server = app.listen(port);

var io = require('socket.io').listen(server);
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var Configuracion_Base= require("./config.json");
var Configuracion_Base_saho=require('./saho_config.json');
var TYPES = require('tedious').TYPES;
var Conexion_BD = require('tedious').Connection;
app.use('/', express.static(__dirname + '/html/'));
//Rutas


require('console-stamp')(console, '[HH:MM:ss]');

var UNIDADES=[];
var MEDICOS=[];
function cargar_nombre_medicos(serv,uni)
{
  var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
  var Servicio='<option  disabled selected>Clinicas</option>';
  //console.log(data);
  Base_de_Datos.on('connect', function(err)
  {
    if (err) {console.log(err);}
    else
    {
        //console.log("Exito al conectar");

        var cadena ="sp_doctores_clinica @servicio , @unidad";

            request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                }
                Base_de_Datos.close();
            });//fin del request

            request.on('doneProc',function (rowCount, more, rows) {
                Servicio+=""
                //console.log("El procedimiento ha terminado ");
            });
            request.on('row',function(columns) {
                var id=columns[0].value.toString();
                var nombre_medico=columns[1].value.toString()+" "+columns[2].value.toString()+" "+columns[3].value.toString()+" "+columns[4].value.toString();
                MEDICOS[id]=nombre_medico;
                //console.log(MEDICOS[id]);
            });
            request.addParameter('servicio',TYPES.VarChar,serv);
            request.addParameter('unidad',TYPES.VarChar,uni);

            Base_de_Datos.execSql(request);

    }
  });//fin de connect
  Base_de_Datos.on('error',function(err) {
    console.log("se ha llamado a la funcion error :  \n"+err);
    Base_de_Datos= new Conexion_BD(Configuracion_Base);
  });
}
function cargar_nombre_unidades(data,per)
{
  var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
  var Servicio='<option  disabled selected>Clinicas</option>';
  //console.log(data);
  Base_de_Datos.on('connect', function(err)
  {
    if (err) {console.log(err);}
    else
    {
        //console.log("Exito al conectar");

        var cadena ="sp_servicio_tipo_unidad @numero";

            request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                }
                //console.log(rowcount);
                Base_de_Datos.close();
            });//fin del request
            request.addParameter('numero',TYPES.Int,data);

            request.on('doneProc',function (rowCount, more, rows) {
                Servicio+=""
                //console.log("El procedimiento ha terminado ");
            });
            request.on('row',function(columns) {
              var id=columns[0].value.toString();
              var nombre_clinica=columns[1].value.toString().replace(/clinica de la/gi,'').replace(/clinica del/gi,'').replace(/clinica de/gi,'').replace(/clinica/gi,'');;

                UNIDADES[id]=per+"  "+nombre_clinica;
                cargar_nombre_medicos(data,id);
                //console.log(UNIDADES[id]);
            });

            Base_de_Datos.execSql(request);

    }
  });//fin de connect
  Base_de_Datos.on('error',function(err) {
    console.log("se ha llamado a la funcion error :  \n"+err);
    Base_de_Datos= new Conexion_BD(Configuracion_Base);
  });
}

cargar_nombre_unidades(1303,"Adultos");
cargar_nombre_unidades(1304,"Pediatria");
cargar_nombre_unidades(1305,"Gineco-Obstetricia");
console.log("Server Iniciado correctamente");



io.sockets.on('connection',function(socket) {

//para que funcione el reverse proxy de nginx
var cliente=socket.request.connection.remoteAddress;
if(socket.request.connection.remoteAddress.toString()=="::ffff:127.0.0.1"||socket.request.connection.remoteAddress.toString()==Configuracion_Servidor.ip)
  cliente=socket.handshake.headers['x-forwarded-for'];
else cliente=socket.request.connection.remoteAddress.substring(7, 19);

    console.log("Conexion desde cliente: "+cliente);


socket.on('imprimir_stricker', function imprimir_stricker(data) {
  const bwipjs = require('bwip-js');

  bwipjs.toBuffer({
          bcid:        'code128',       // Barcode type
          text:        data.expediente,    // Text to encode
          scale:       3,               // 3x scaling factor
          height:      10,              // Bar height, in millimeters
          includetext: true,            // Show human-readable text
          textxalign:  'center',        // Always good to set this
        },
        function (err, png) {
            if (err) {
              // Decide how to handle the error
              // `err` may be a string or Error object
              console.log(err);
            }
            else {
              require("fs").writeFile("html/Reportes/s_"+data.expediente+".png", png, 'base64', function(err) {
                if(err){}
                else{
                  var dare={redirect:"http://"+Configuracion_Servidor.ip+":"+Configuracion_Servidor.puerto+'/Reportes/s_'+data.expediente+".pdf"};
                  PDFDocument = require('pdfkit');
                  doc = new PDFDocument({layout : 'landscape'});
                  fs = require('fs');
                  doc.pipe(fs.createWriteStream('html/Reportes/s_'+data.expediente+".pdf"));
                  doc.image(__dirname+'/html/Reportes/s_'+data.expediente+'.png', 625, 245, {width: 100});
                  doc.moveDown(13)
                  doc.fontSize(14).text("                                                      Nombre Paciente: ");
                  doc.text("                                                      "+data.nombre);
                  if(data.cantidad==2)
                  {
                    doc.moveDown(5)
                    doc.image(__dirname+'/html/Reportes/s_'+data.expediente+'.png', 625, 365, {width: 100});
                    doc.fontSize(14).text("                                                      Nombre Paciente: ");
                    doc.text("                                                      "+data.nombre);
                  }
                  doc.end();
                  socket.emit('impresion_sticker_exitosa',dare);
                }
            });

            }
          });

});


socket.on('reimpresion_cita',function(data) {
  var fs = require('fs');
  var espacios="";
  for(var i=0;i<data.linea;i++) espacios+="\n";
  fs.writeFile('html/Reportes/C'+cliente+".txt",espacios+data.linea+"  "+ data.txt, function (err) {
    if (err) console.log("Error creando archivo de citas"+err);
    //console.log('Archivo de citas creado para impresion');
  });
//console.log(data);
var dare={redirect:"http://"+Configuracion_Servidor.ip+":"+Configuracion_Servidor.puerto+'/Reportes/C'+cliente+".txt"}
socket.emit('reimpresion_cita_exitosa',dare);
});



  socket.on('prueba',function(data) {
    var Base_de_Datos= new Conexion_BD(Configuracion_Base);
    Base_de_Datos.on('connect', function(err)
    {
      if (err) {console.log(err);}
      else
      {
          console.log("Exito al conectar");
          var cadena ="SELECT * FROM provisional.dbo.Expediente where id_expediente=@numero";

              request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                  }
                  Base_de_Datos.close();
                    console.log("Se ha cerrado la conexion");
              });//fin del request
              request.addParameter('numero',TYPES.VarChar,201755000);

              request.on('doneProc',function (rowCount, more, rows) {
                  console.log("El procedimiento ha terminado ");
              });
              request.on('row',function(columns) {
                  console.log("row");
              });
              Base_de_Datos.execSql(request);

      }
    });//fin de connect
    Base_de_Datos.on('error',function(err) {
      console.log("se ha llamado a la funcion error :  \n"+err);
      Base_de_Datos= new Conexion_BD(Configuracion_Base);
    });
    Base_de_Datos.on('end',function() {
      console.log("La funcion end se ha llamdo ");
    });


    console.log(data);
  });//cierre socket on prueba

var listado_imprimir={}
var key_listado = 'Citas';
listado_imprimir[key_listado] = [];
socket.on('imprimir_listado_archivo',function(data) {
  var currentdate = new Date();
  var datetime = "" + currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/"+ currentdate.getFullYear() + "";
  var fecha_impresion=datetime;
  var hora_impresion = ""+ currentdate.getHours() + ":"+ currentdate.getMinutes() + ":" + currentdate.getSeconds();
  PDFDocument = require('pdfkit');
  doc = new PDFDocument({size:'legal'});
  fs = require('fs');
  doc.pipe(fs.createWriteStream('html/Reportes/Listado_'+cliente+".pdf"));

  doc.image(__dirname+'/html/img/lh.png', 50, 20, {width: 100});
  doc.fontSize(6).text("  Fecha de impresion:"+fecha_impresion,{align: 'right'});
  doc.fontSize(6).text("  Hora de impresion:"+hora_impresion,{align: 'right'});
  doc.moveUp(6);
  doc.fontSize(14).font('Times-Roman').fillColor('#005B99').text("                       Hospital General San Juan de Dios");
  doc.fontSize(14).text("                       Sistema de Gestion Hospitalaria");
  doc.fontSize(14).text("                       Registros medicos");
  doc.moveUp();
  doc.fontSize(5).text(".");
  doc.fontSize(14).text("                       ______________________________________________________");
  doc.moveDown();

  doc.moveDown();
  doc.fontSize(14).fillColor('black').text("                                                Busqueda de Expedientes");
doc.moveDown();
  doc.fontSize(14).fillColor('black').text("Usuario: "+data.nombre_personal);

  doc.fontSize(14).fillColor('black').text("Fecha: "+data.fecha);
  doc.fontSize(14).text("Cantidad de Expedientes: "+listado_imprimir[key_listado].length);

  doc.moveDown();doc.moveDown();
  //console.log(listado_imprimir[key_listado][0])
  doc.fontSize(10).text("No.    Expediente    " +"  "+"Servicio    Unidad");
  doc.moveUp();
  doc.fontSize(10).text("  Entregado          Recibido    ",{align: 'right'});
  doc.fontSize(5).text(".");
  for(var i=0; i<listado_imprimir[key_listado].length;i++)
  {
    doc.fontSize(10).text((i+1001).toString().substring(1,4)+"   "+listado_imprimir[key_listado][i].exp +"    "+listado_imprimir[key_listado][i].unidad);
    doc.moveUp();
    doc.fontSize(10).text("__________     __________",{align: 'right'});

    doc.fontSize(5).text(".");
  }
  doc.fontSize(12).text('         1a Avenida 10-50 Zona1, Sotano- TELEFONO: PBX: 22219191 EXT 6012-6013-DIRECTO: 23219124', 20, doc.page.height - 50,{
    lineBreak: false
  });
  doc.end();
    socket.emit('listado_exitoso',"http://"+Configuracion_Servidor.ip+":"+Configuracion_Servidor.puerto+"/Reportes/Listado_"+cliente+".pdf");
    console.log("Solicitud de impresion desde cliente: "+cliente);


//console.log(listado_imprimir);
})

  socket.on('archivo',function(data) {
    //console.log(data);
    var Base_de_Datos= new Conexion_BD(Configuracion_Base);
    var Servicio='<div id="tabla_expedientes" class="row"><table class=" striped centered"> <thead><tr> <th>No. de expediente</th> <th>Clinica</th> </tr> </thead> <tbody>';
    Base_de_Datos.on('connect', function(err)
    {
      if (err) {console.log(err);}
      else
      {
          //console.log("Exito al conectar");

          var cadena ="sp_archivo_listado @empleado , @fecha";
          listado_imprimir={}
          key_listado = 'Citas';
          listado_imprimir[key_listado] = [];
              request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                  }
                  Base_de_Datos.close();
                    console.log("Se ha realizado una consulta de citas desde el cliente: "+cliente);
                    socket.emit('tabla_archivo',Servicio);
              });//fin del request

              request.on('doneProc',function (rowCount, more, rows) {
                  Servicio+="</tbody></table> ";
                  //console.log(Servicio);
              });
              request.on('row',function(columns) {

                  var anio=columns[0].value.toString();
                  var correlativo=columns[1].value.toString();
                  var ceros=7-correlativo.length;
                  var c='';
                  for(var i=0 ; i<ceros;i++)
                    c+="0";
                  var unidadn=columns[3].value.toString();
                  Servicio+="<tbody><tr><td>"+anio+c+correlativo+"</td>"+"<td>"+UNIDADES[unidadn]+"</td></tr></tbody>";
                  listado_imprimir[key_listado].push({exp:anio+c+correlativo,unidad:UNIDADES[unidadn]});
              });
              request.addParameter('empleado',TYPES.VarChar,data.usuario);
              request.addParameter('fecha',TYPES.VarChar,data.fecha);

              Base_de_Datos.execSql(request);

      }
    });//fin de connect
    Base_de_Datos.on('error',function(err) {
      console.log("se ha llamado a la funcion error :  \n"+err);
      Base_de_Datos= new Conexion_BD(Configuracion_Base);
    });
  });//cierre socket archivo



  socket.on('medicos',function(data) {
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
    var Servicio='<option disabled selected selected="selected">Medicos</option>';
    Base_de_Datos.on('connect', function(err)
    {
      if (err) {console.log(err);}
      else
      {
          //console.log("Exito al conectar");

          var cadena ="sp_doctores_clinica @servicio , @unidad";

              request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                  }
                  Base_de_Datos.close();
                    //console.log("Se ha cerrado la conexion");
                    socket.emit('llenar_medicos',Servicio);
              });//fin del request

              request.on('doneProc',function (rowCount, more, rows) {
                  Servicio+=""
                  //console.log("El procedimiento ha terminado ");
              });
              request.on('row',function(columns) {
                  var id=columns[0].value.toString();
                  var nombre_medico=columns[1].value.toString()+" "+columns[2].value.toString()+" "+columns[3].value.toString()+" "+columns[4].value.toString();
                  Servicio+="<option value='"+id+"'>"+nombre_medico+"</option>";
              });
              request.addParameter('servicio',TYPES.VarChar,data.servicio);
              request.addParameter('unidad',TYPES.VarChar,data.unidad);

              Base_de_Datos.execSql(request);

      }
    });//fin de connect
    Base_de_Datos.on('error',function(err) {
      console.log("se ha llamado a la funcion error :  \n"+err);
      Base_de_Datos= new Conexion_BD(Configuracion_Base);
    });
  });//cierre socket on mostrar doctores



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

        var cadena ="exec @linea = sp_cita_linea @anio, @correlativo,0";

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

                          request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request de crear cita "+err);
                        console.log(data);} if (rowcount) {

                              }
                              Base_de_Datos.close();
                              var fs = require('fs');
                              var espacios="";
                              for(var i=0;i<data.linea;i++) espacios+="\n";
                              fs.writeFile('html/Reportes/C'+cliente+".txt",espacios+data.linea+"  "+ data.fecha+"-"+data.hora+"-"+data.nombre_servicio+"-"+data.nombre_unidad+"-"+data.nombre_medico, function (err) {
                                if (err) console.log("Error creando archivo de citas"+err);
                                console.log('Archivo de citas creado para impresion');
                              });
                              //doc.text(".",30,1)
                              //for(var i=0;i<data.linea;i++)
                              //  doc.moveDown();doc.moveDown();doc.moveDown();
                              //doc.fontSize(8).text(data.fecha+"-"+data.hora+"-"+data.nombre_servicio+"-"+data.nombre_unidad+"-"+data.nombre_medico);
                              //doc.end()
                              //console.log("Creacion de cita exitosa desde el cliente: "+cliente)
                              //console.log(UNIDADES[data.unidad]);
                              //console.log(data.unidad);
                              var dare={redirect:"http://"+Configuracion_Servidor.ip+":"+Configuracion_Servidor.puerto+'/Reportes/C'+cliente+".txt",fecha:data.fecha,clinica:UNIDADES[data.unidad]}
                              socket.emit('cita_exitosa',dare);

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
              //console.log("La linea que toca es "+data.linea)
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



socket.on('buscar_cita_expediente',function(data) {
  var Base_de_Datos= new Conexion_BD(Configuracion_Base);
  var Servicio='<table class="striped centered"><thead><tr><th>Fecha</th><th>Hora</th><th>Clinica</th><th>Medico</th><th>IMP</th></tr></thead><tbody>';

  Base_de_Datos.on('connect', function(err)
  {
    if (err) {console.log(err);}
    else
    {
        //console.log("Exito al conectar");

        var cadena ="exec sp_cita_por_expediente @anio, @correlativo";

            request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                }
                Base_de_Datos.close();

                console.log("Se han consultado citas desde el cliente: "+cliente)
                socket.emit('llenar_tabla_citas_exp',Servicio);
            });//fin del request

            request.on('doneProc',function (rowCount, more, rows) {
              Servicio+="</tbody></table> ";
                //console.log("El procedimiento ha terminado ");
            });
            request.on('row',function(columns) {
                var Cfecha=columns[0].value.toString();
                var Chora=columns[1].value.toString();
                var unidadn=columns[2].value.toString();
                var medidn=columns[3].value.toString();
                Servicio+="<tbody><tr><td>"+Cfecha+"</td><td>"+Chora+"</td><td>"+UNIDADES[unidadn]+"</td><td>"+MEDICOS[medidn]+"</td><td class=\"boton_imprimir_cita\"><img src=\"/img/impresora.png\" alt=\"Imprimir\" width=\"50px\" height=\"50px\"/></td></tr></tbody>";

            });
            request.addParameter('anio',TYPES.Int,data.no_expediente.substring(0, 4));
            request.addParameter('correlativo',TYPES.Int,data.no_expediente.substring(4, 11));



            Base_de_Datos.execSql(request);

    }
  });//fin de connect
  Base_de_Datos.on('error',function(err) {
    console.log("se ha llamado a la funcion error :  \n"+err);
    Base_de_Datos= new Conexion_BD(Configuracion_Base);
  });

});//final de on buscar_cita_expediente



socket.on('comprobar_cita',function(data) {
  var Base_de_Datos= new Conexion_BD(Configuracion_Base);
  //console.log(data);
  Base_de_Datos.on('connect', function(err)
  {
    if (err) {console.log(err);}
    else
    {
      var status={status:'-1',jsdata:data};
        var cadena ="exec @status= sp_cita_verifica @anio, @correlativo , @fecha , @servicio , @unidad ,0";

            request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                }
                Base_de_Datos.close();
                socket.emit('cita_posible',status);

            });//fin del request

            request.on('doneProc',function (rowCount, more, rows) {

                //console.log("El procedimiento ha terminado ");
            });
            request.on('row',function(columns) {
                var id=columns[0].value.toString();
                //console.log("Se ha encontrado un row "+id);

            });
            request.on('returnValue', function(parameterName, value, metadata) {
              //console.log(parameterName + ' = ' + value);
              status.status=value;
              status.statusnombre=UNIDADES[value];
            });

            //console.log(data);
            request.addParameter('anio',TYPES.Int,data.no_expediente.substring(0, 4));
            request.addParameter('correlativo',TYPES.Int,data.no_expediente.substring(4, 11));
            //request.addParameter('fecha',TYPES.Date,data.fecha);
            request.addParameter('servicio',TYPES.Int,data.servicio);
            request.addParameter('unidad',TYPES.Int,data.unidad);

            //request.addParameter('anio',TYPES.Int,"2017");
            //request.addParameter('correlativo',TYPES.Int,'0055001');
            request.addParameter('fecha',TYPES.Date,data.fecha);
            //request.addParameter('servicio',TYPES.Int,'1303');
            //request.addParameter('unidad',TYPES.Int,1387);
            request.addOutputParameter('status', TYPES.VarChar);

            Base_de_Datos.execSql(request);

    }
  });//fin de connect


  Base_de_Datos.on('error',function(err) {
    console.log("se ha llamado a la funcion error :  \n"+err);
    Base_de_Datos= new Conexion_BD(Configuracion_Base);
  });

});//final de on crear cita





  socket.on('servicios',function(data) {
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
    var Servicio='<option disabled selected selected="selected">Areas</option>';
    Base_de_Datos.on('connect', function(err)
    {
      if (err) {console.log(err);}
      else
      {
          //console.log("Exito al conectar");

          var cadena ="sp_servicio_tipo";

              request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                  }
                  Base_de_Datos.close();
                    //console.log("Se ha cerrado la conexion");
                    socket.emit('llenar_servicios',Servicio);
              });//fin del request

              request.on('doneProc',function (rowCount, more, rows) {
                  Servicio+=""
                  //console.log("El procedimiento ha terminado ");
              });
              request.on('row',function(columns) {
                  var id=columns[0].value.toString();
                  var nombre_clinica=columns[1].value.toString();
                  Servicio+="<option value='"+id+"'>"+nombre_clinica+"</option>";
              });

              Base_de_Datos.execSql(request);

      }
    });//fin de connect
    Base_de_Datos.on('error',function(err) {
      console.log("se ha llamado a la funcion error :  \n"+err);
      Base_de_Datos= new Conexion_BD(Configuracion_Base);
    });
  });//cierre socket on mostrar servicios



  socket.on('unidades_auto',function(data) {
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
    var Servicio='{';
    //console.log(data);
    Base_de_Datos.on('connect', function(err)
    {
      if (err) {console.log(err);}
      else
      {
          //console.log("Exito al conectar");

          var cadena ="sp_servicio_tipo_unidad @numero";

              request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                  }
                  //console.log(rowcount);
                  Base_de_Datos.close();
                    //console.log("Se han llenado unidaddes auto ");
                    //console.log(Servicio);
                    socket.emit('llenar_unidades',Servicio);
              });//fin del request
              request.addParameter('numero',TYPES.Int,data);

              request.on('doneProc',function (rowCount, more, rows) {
                  Servicio+='"aaa":"00"}'
                  //console.log("El procedimiento ha terminado ");
              });
              request.on('row',function(columns) {
                  var id=columns[0].value.toString();
                  var nombre_clinica=columns[1].value.toString().replace(/clinica de la/gi,'').replace(/clinica del/gi,'').replace(/clinica de/gi,'').replace(/clinica/gi,'');
                  Servicio+='"'+id+"-"+nombre_clinica+"\":\"\",";


              });

              Base_de_Datos.execSql(request);

      }
    });//fin de connect
    Base_de_Datos.on('error',function(err) {
      console.log("se ha llamado a la funcion error :  \n"+err);
      Base_de_Datos= new Conexion_BD(Configuracion_Base);
    });
  });//cierre socket on mostrar servicios


  socket.on('unidades',function(data) {
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
    var Servicio='<option  disabled selected>Clinicas</option>';
    //console.log(data);
    Base_de_Datos.on('connect', function(err)
    {
      if (err) {console.log(err);}
      else
      {
          //console.log("Exito al conectar");

          var cadena ="sp_servicio_tipo_unidad @numero";

              request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                  }
                  //console.log(rowcount);
                  Base_de_Datos.close();
                    //console.log("Se ha cerrado la conexion");
                    socket.emit('llenar_unidades',Servicio);
              });//fin del request
              request.addParameter('numero',TYPES.Int,data);

              request.on('doneProc',function (rowCount, more, rows) {
                  Servicio+=""
                  //console.log("El procedimiento ha terminado ");
              });
              request.on('row',function(columns) {
                  var id=columns[0].value.toString();
                  var nombre_clinica=columns[1].value.toString().replace(/clinica de la/gi,'').replace(/clinica del/gi,'').replace(/clinica de/gi,'').replace(/clinica/gi,'');
                  Servicio+="<option value='"+id+"'>"+nombre_clinica+"</option>";


              });

              Base_de_Datos.execSql(request);

      }
    });//fin de connect
    Base_de_Datos.on('error',function(err) {
      console.log("se ha llamado a la funcion error :  \n"+err);
      Base_de_Datos= new Conexion_BD(Configuracion_Base);
    });
  });//cierre socket on mostrar servicios

var linea_cliente=0;

  socket.on('ver_expediente',function(data) {
    var base_en_uso="saho";
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
    var Base_de_Datos1= new Conexion_BD(Configuracion_Base);
    var estado=0;
    var Servicio="<select id='unidades'>";
    data=data.replace('-','');
    var anio=data.toString().substring(0,4);
    var correlativo=data.toString().substring(4,12);
    //console.log(anio);
    var respuesta={};
    var respuestap={};
    //console.log(correlativo);
    Base_de_Datos.on('connect', function(err)
    {
      if (err) {console.log(err);}
      else
      {
          var cadena ="sp_expediente_consulta @anio , @correlativo";

              request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                  }
                  //console.log(rowcount);
                  if(Object.keys(respuesta).length === 0)
                  {
                    estado+=1;
                    if(estado>1)
                    {
                      socket.emit('Expediente_no_existe');
                    }
                  }
                  else
                  {
                    socket.emit('mostrar_paciente',respuesta);
                  }
                      Base_de_Datos.close();



              });//fin del request
              request.addParameter('anio',TYPES.Int,anio);
              request.addParameter('correlativo', TYPES.Int,correlativo);

              request.on('doneProc',function (rowCount, more, rows) {

                  //console.log("El procedimiento ha terminado ");
              });
              request.on('row',function(columns) {
                  var anio=columns[0].value;
                  var correlativo=columns[1].value;
                  var apellido1=columns[4].value;
                  var apellido2=columns[5].value;
                  var nombre1=columns[2].value;
                  var nombre2=columns[3].value;
                  var identificacion=columns[6].value;
                  var linea=columns[7].value;
                  var edad=columns[8].value;
                  linea_cliente=linea;
                  respuesta={exp:data,nombre1:nombre1,nombre2:nombre2,apellido1:apellido1,apellido2:apellido2,identificacion:identificacion,linea:linea,edad:edad};
                  //console.log(respuesta);

              });

              Base_de_Datos.execSql(request);

      }
    });//fin de connect
    Base_de_Datos.on('error',function(err) {
      console.log("se ha llamado a la funcion error :  \n"+err);
      Base_de_Datos= new Conexion_BD(Configuracion_Base);
    });


    Base_de_Datos1.on('connect', function(err)
    {
      if (err) {console.log(err);}
      else
      {
          var cadena ="sp_expediente_consulta @anio , @correlativo";

              request = new Request(cadena,function(err, rowcount) { if (err) {console.log("Error en el request"+err);} if (rowcount) {

                  }
                  if(Object.keys(respuestap).length === 0)
                  {
                    estado+=1;
                    if(estado>1)
                    {
                      socket.emit('Expediente_no_existe');
                    }
                  }
                  else
                  {
                    socket.emit('mostrar_paciente',respuestap);
                  }

                  Base_de_Datos1.close();




              });//fin del request
              request.addParameter('anio',TYPES.Int,anio);
              request.addParameter('correlativo', TYPES.Int,correlativo);

              request.on('doneProc',function (rowCount, more, rows) {

                  //console.log("El procedimiento ha terminado ");
              });
              request.on('row',function(columns) {

                  var anio=columns[0].value;
                  var correlativo=columns[1].value;
                  var apellido1=columns[4].value;
                  var apellido2=columns[5].value;
                  var nombre1=columns[2].value;
                  var nombre2=columns[3].value;
                  var identificacion=columns[6].value;
                  var linea=columns[7].value;
                  var edad=columns[8].value;
                  respuestap={exp:data,nombre1:nombre1,nombre2:nombre2,apellido1:apellido1,apellido2:apellido2,identificacion:identificacion,linea:linea,edad:edad};
                  //console.log(respuesta);

              });

              Base_de_Datos1.execSql(request);

      }
    });//fin del segundo connect



  });// fin del socket on ver_expediente

  socket.on('angular',function(data) {
    socket.emit('angularr','Respuesta desde node ');
  });//cierre socket on mostrar servicios








});
