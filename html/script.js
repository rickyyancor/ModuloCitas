
$(document).ready(function() {
var socket=io();
socket.emit('servicios');
socket.on('llenar_servicios',(data)=>{

  $("#para_servicios").html(data);
  var datain=$("#servicio").val();
  socket.emit('unidades',datain);

  $('#servicio').on('change', function() {
    var datain=$("#servicio").val();
    socket.emit('unidades',datain);
  });
  socket.on('llenar_unidades',function(unid) {
    $("#para_unidades").html(unid);
  });

});//end on llenar servicios

$("#btn").click(function(){
  socket.emit('ver_expediente',$("#no_expediente").val());

});
socket.on('Expediente_no_existe', () => {
  console.log("El numero de expediente es incorrecto : ");

});
socket.on('mostrar_paciente', (data) => {
      console.log(data.apellido1);
    });

socket.on('connect', () => {
      console.log("Conectado: "+socket.id);
    });
socket.on('mensaje',(data) =>{
    alert(data);
});


});// en document ready
