var port = process.env.PORT || 3000;
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
app.get('/', function (req, res) {
res.send(Configuracion_Base);
});

io.sockets.on('connection',function(socket) {

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



  socket.on('servicios',function(data) {
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
    var Servicio="<select id='servicio'>";
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
                  Servicio+="</select>"
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


  socket.on('unidades',function(data) {
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
    var Servicio="<select id='unidades'>";
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
                  Servicio+="</select>"
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


  socket.on('ver_expediente',function(data) {
    var base_en_uso="saho";
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
    var Base_de_Datos1= new Conexion_BD(Configuracion_Base);
    var estado=0;
    var Servicio="<select id='unidades'>";
    data=data.replace('-','');
    var anio=data.toString().substring(0,4);
    var correlativo=data.toString().substring(4,12);
    console.log(anio);
    var respuesta={};
    var respuestap={};
    console.log(correlativo);
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
                  var nombre1=columns[3].value;
                  var nombre2=columns[4].value;
                  var identificacion=columns[6].value;
                  var linea=columns[7].value;
                  respuesta={anio:anio,correlativo:correlativo,nombre1:nombre1,nombre2:nombre2,apellido1:apellido1,apellido2:apellido2,identificacion:identificacion,linea:linea};
                  console.log(respuesta);

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
                  var nombre1=columns[3].value;
                  var nombre2=columns[4].value;
                  var identificacion=columns[6].value;
                  var linea=columns[7].value;
                  respuestap={anio:anio,correlativo:correlativo,nombre1:nombre1,nombre2:nombre2,apellido1:apellido1,apellido2:apellido2,identificacion:identificacion,linea:linea};
                  console.log(respuesta);

              });

              Base_de_Datos1.execSql(request);

      }
    });//fin del segundo connect



  });// fin del socket on ver_expediente

  socket.on('angular',function(data) {
    socket.emit('angularr','Respuesta desde node ');
  });//cierre socket on mostrar servicios








});
