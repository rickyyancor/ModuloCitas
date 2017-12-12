
$(document).ready(function() {
  var socket=io();


  $('select').material_select();

  $('#columnapequeña').show(300);
      //slide var
      $('.button-collapse').sideNav({
            menuWidth: 300, // Default is 300
            edge: 'left', // Choose the horizontal origin
            closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true, // Choose whether you can drag to open on touch screens,
            onOpen: function(el) {$('#icono').hide(300) /* Do Stuff*/ }, // A function to be called when sideNav is opened
            onClose: function(el) { /* Do Stuff*/ }, // A function to be called when sideNav is closed
          }
        );
  var nombre,fecha,altura,ancho;
  altura = screen.height
ancho = screen.width

if(altura<= 848 && ancho <= 412){
    $('#icono').hide();
    $('#columnapequeña').hide();
    $('#columnagrande').removeClass('col s9');
    $('#columnagrande').addClass('col s12')
    $('#seleccion').addClass('col s10')
}else{
        console.log('No pasa nad papu')
}


$('#fecha_extras').pickadate({
format:'yyyy-mm-dd',
selectYears: true,
selectMonths: true,
min:new Date(),
disable: [1, 7],
today: 'Hoy',
clear: 'Limpiar',
close: 'Cerrar',
monthsFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
weekdaysShort:['Dom','Lun','Mar','Mier','Juev','Vier','Sab'],
hiddenSuffix: '_submit',
showdaysShort: true,
weekdaysFull:['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
labelMonthNext: 'Siguiente mes',
labelMonthPrev: 'Mes anterior',
labelMonthSelect: 'Seleccionar mes',
labelYearSelect: 'Seleccionar año',

});
  //fecha
  $('#fechaRegistros').pickadate({
  format:'yyyy-mm-dd',
  selectYears: true,
  selectMonths: true,
  min:new Date(),
  disable: [1, 7],
  today: 'Hoy',
  clear: 'Limpiar',
  close: 'Cerrar',
  monthsFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  weekdaysShort:['Dom','Lun','Mar','Mier','Juev','Vier','Sab'],
  hiddenSuffix: '_submit',
  showdaysShort: true,
  weekdaysFull:['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
  labelMonthNext: 'Siguiente mes',
  labelMonthPrev: 'Mes anterior',
  labelMonthSelect: 'Seleccionar mes',
  labelYearSelect: 'Seleccionar año',

  });

  $('select#users').on('change',function(){
  nombre = $(this).val();
  });



  $('#btnrefrescar').click(function(){

        location.reload();

  })
  $('#btnrefrescar_extras').click(function(){

        location.reload();

  })
  $('#btnimprimir').click(function(){

    var fecha=$("#fechaRegistros").val();
    var usuario=$("#users").val();
    var nousuario=$("#users option:selected").text();
    var jsdata={fecha:fecha,usuario:usuario,nombre_personal:nousuario}
    socket.emit('imprimir_listado_archivo',jsdata);

  })
  $('#btnimprimir_extras').click(function(){

    var fecha=$("#fecha_extras").val();
    var unidad=$("#area").val();
    var jsdata={fecha:fecha,unidad:unidad}
    socket.emit('imprimir_listado_archivo_extras',jsdata);

  })
  $('#div_extras').hide(300);
  $('#archivosMedicos').show(300);
  $('#link_registros').click(function(){

    $('#div_extras').hide(300);
    $('#archivosMedicos').show(300);


  })
  $('#link_extras').click(function(){
        $('#archivosMedicos').hide(300);
        $('#div_extras').show(300);

  })

  $('#btnBuscarRegistros').click(function(){
    fecha= $('#fechaRegistros').val()

    if(nombre!=null && fecha!=""){

      //$('#seleccion').hide(300);
      //$('#titulo1').hide(300);

      var fecha=$("#fechaRegistros").val();
      var usuario=$("#users").val();
      var nousuario=$("#users option:selected").text();
      var jsdata={fecha:fecha,usuario:usuario,nombre_personal:nousuario}
      socket.emit('archivo',jsdata);

    }
    else {
      swal(
        'Oops...',
        'Debe llenar todos los campos!',
        'error'
          )
    }
  })
  $('#btnBuscarExtras').click(function(){
    fecha= $('#fecha_extras').val()
    var unidad=$("#area").val();
    if(unidad!=null && fecha!=""){




      var jsdata={fecha:fecha,unidad:unidad}
      socket.emit('archivo_extras',jsdata);

    }
    else {
      swal(
        'Oops...',
        'Debe llenar todos los campos!',
        'error'
          )
    }
  })

  $('select').material_select();
  $('select').on('contentChanged', function() {
    // re-initialize (update)
    $(this).material_select();
  });


  socket.emit('servicios');
  socket.on('llenar_servicios',(data)=>{
    console.log(data);
    var $selectareas =$("#area").empty().html(' ').append(data).trigger('contentChanged');

  });//end on llenar servicios




socket.on('tabla_archivo',(data)=>{
  $('#tablaRegistros').show(300);
  $('#recargar').show(300);
  $('#paratablaexp').html(data);

});//end on llenar servicios

socket.on('tabla_archivo_extras',(data)=>{
  $('#tabla_extras').show(300);
  $('#recargar_extras').show(300);
  $('#paratablaexp_extras').html(data);

});//end on llenar servicios

socket.on('listado_exitoso',(data) =>{
    window.open(data);
});


});// en document ready
