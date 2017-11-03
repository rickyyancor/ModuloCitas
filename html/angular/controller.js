var app = angular.module('myApp',[]);
app.controller('controlador', function($scope){
  var socket = io();
  socket.emit('angular');
  socket.on('angularr',function(data) {
    $scope.primerNombre = data;
      
  });
  $scope.segundoNombre= "Francisco"
  $scope.primerApellido = "Castillo";

})
