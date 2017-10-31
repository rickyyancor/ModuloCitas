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



  socket.on('clinicas',function(data) {
    var Base_de_Datos= new Conexion_BD(Configuracion_Base_saho);
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
  });//cierre socket on mostrar clinicas



});
