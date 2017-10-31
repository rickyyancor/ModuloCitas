$(function() {
    var socket = io('http://10.10.11.153:3000/');


    $("#btn").click(function(){

        socket.emit('prueba',socket.id);


    });
socket.on('connect', () => {
      console.log("Conectado: "+socket.id);
    });
    socket.on('mensaje',(data) =>{
        alert(data);
    });


});
