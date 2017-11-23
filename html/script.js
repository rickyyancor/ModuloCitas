
$(document).ready(function() {
  $('#crear_citas').show(300);
  $('#busqueda_cita').hide(300);
  var numerocita;//agregar|
  var longitudcita;//agregar|
  ///nuevo menu
  var altura, ancho// aca otro cambio +
            altura = screen.height
            ancho = screen.width
            if(altura<= 843 && ancho <= 412){
                $('#icono').hide();
                $('#columnapequeña').hide();
                $('#columnagrande').removeClass('col s9');
                $('#columnagrande').addClass('col s12')
                $('#selecciones').addClass('col s10')
            }else{
                    console.log('No pasa nad papu')
            }

$('.collapsible').collapsible();
$('.button-collapse').sideNav({
                menuWidth: 300, // Default is 300
                edge: 'left', // Choose the horizontal origin
                closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
                draggable: true, // Choose whether you can drag to open on touch screens,
                onOpen: function(el) {$('#icono').hide(300)  },
                onClose: function(el) { },
              }
            );
  $('#link_crear_cita').click(function(){//agregar |

        $('#crear_citas').show(300);
        $('#busqueda_cita').hide(300);


  })
  $('#btnNueva').click(function(){
          location.reload();
    })
    $('#btn_imprimir_sticker').click(function(){
          var data_sticker={expediente:$("#tdexpediente").html(),nombre:$("#tdnombre").html(),cantidad:1};
          socket.emit('imprimir_stricker',data_sticker);


      })
      $('#btn_imprimir_sticker2').click(function(){
            var data_sticker={expediente:$("#tdexpediente").html(),nombre:$("#tdnombre").html(),cantidad:2};
            socket.emit('imprimir_stricker',data_sticker);


        })
  $('#link_buscar_cita').click(function(){  //agregar |

        $('#busqueda_cita').show(300);
        $('#crear_citas').hide(300);



  })
  $("#btnBuscarcita").click(function()
          {

            numerocita = $('#nexpediente_busqueda').val();
            longitudcita = numerocita.length;
            //validacion para campo del numero de carne
            if(longitudcita == 11 && longitudcita!=null){
              $('#tabla_citas').show(300);
              //$('#busqueda_citas').hide(300);
              var dat={no_expediente:numerocita}
              socket.emit('buscar_cita_expediente',dat);
            }//FIN DEL IF
            else
            {
              swal('Debe ingresar un numero de carné valido');
              $('#nexpediente_busqueda').show(300);
            }//FIN ELSE





          });

  //fin menu

  $('#horaCita').pickatime();
   $('#fechaCita').pickadate({
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



var socket=io();
socket.on('impresion_sticker_exitosa',function(data) {
  console.log("Exito");
  window.open(data.redirect);
  location.reload();

});
$('select').material_select();
$('select').on('contentChanged', function() {
  // re-initialize (update)
  $(this).material_select();
});

socket.emit('servicios');
socket.on('llenar_servicios',(data)=>{

var linea_cliente=0;

  // initialize


  // clear contents
      var $selectareas =$("#area").empty().html(' ').append(data).trigger('contentChanged');

  var datain=$("#area").val();
  socket.emit('unidades',datain);

  $('#area').on('change', function() {
    var datain=$("#area").val();
    console.log("area cambio");
    socket.emit('unidades_auto',datain);
  });
  $('#clinica_u').on('change', function() {
    var unidad=$('#clinica').val();
    var servicio=$('#area').val();
    var dat={unidad:unidad, servicio:servicio};
    socket.emit('medicos',dat);  });
  socket.on('llenar_unidades',function(unid) {
    //console.log(unid);
    var d="{}";
    try {
      d=JSON.parse(unid);
    } catch (e) {

    } finally {

    }

    $('#clinicas_u').autocomplete({ //++
        data: d,
        limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
        onAutocomplete: function(val) {

            var unidad=val.toString().substring(0,4);
            var servicio=$('#area').val();
            var dat={unidad:unidad, servicio:servicio};
            console.log("Callback autocomplete");
            console.log(dat);
            socket.emit('medicos',dat);
          // Callback function when value is autcompleted.
        },
        minLength: 0, // The minimum length of the input for the autocomplete to start. Default: 1.
      });


    var $selectclinicas =$("#clinica").empty().html(' ').append(unid).trigger('contentChanged');

  });
  socket.on('llenar_medicos',function(unid) {
    var $selectmedicos =$("#medico").empty().html(' ').append(unid).trigger('contentChanged');

  });

});//end on llenar servicios

socket.on('llenar_tabla_citas_exp',function (data) {
  //console.log(data);
  $('#paratablacitas_exp').html(data);
  $(".boton_imprimir_cita").click(function() {
    var valores="";
    var registro=$(this).parents("tr").find("td");
    var cont=0;
    $(this).parents("tr").find("td").each(function(){
      if(cont<4){
        valores+=$(this).html()+"*";cont++;
      }
    });

    swal({
      title: 'Ingrese el numero de linea',
      input: 'number',
      showCancelButton: true,
      confirmButtonText: 'OK',
      showLoaderOnConfirm: true,
      preConfirm: function (data) {
        console.log(data)
        return new Promise(function (resolve, reject) {
          var dat={};
          dat.txt=valores;
          dat.linea=data;
          socket.emit('reimpresion_cita',dat);
          resolve();

        })
      },
      allowOutsideClick: false
    }).then(function (resolve) {


    },function (reject) {

    }
  )






  })
});


$("#btn").click(function(){
  socket.emit('ver_expediente',$("#no_expediente").val());

});
socket.on('Expediente_no_existe', () => {
  console.log("El numero de expediente es incorrecto : ");
  swal('El Numero de Expediente no existe');
  $('#nexpediente').show(300);

});
socket.on('mostrar_paciente', (data) => {
  $('#tdnombre').html(data.nombre1+" "+data.nombre2+" "+data.apellido1+" "+data.apellido2);
  linea_cliente=data.linea;
  $('#tdexpediente').html(data.exp);
  $('#tdidentificacion').html(data.identificacion);

  $('#tdedad').html(data.edad);
  $('#selecciones').show(300);
  $('#busqueda').hide(300);
  $('#divBotonGuardar').show(300);
  $('#tabla').show(300);
    });

socket.on('connect', () => {
      console.log("Conectado: "+socket.id);
    });
socket.on('mensaje',(data) =>{
    alert(data);
});
socket.on('cita_posible',function(info) {
  console.log(info);
  if(info.status==0)
  {
    socket.emit('crear_cita',info.jsdata);
  }
  else if(info.status==1)
  {
    //No se permite cita entre los 5 dias
    swal(
      'Error',
      'Existe una cita entre los 5 dias',
      'error'
    )
  }
  else if(info.status==2)
  {
    //Ya existe mas de una cita en el mismo servicio
    swal(
      'Error',
      'Ya existe mas de una cita en el mismo servicio!',
      'error'
    )
  }
  else if(info.status==3)
  {
    //esta cita ya fue creada
    swal(
      'Error',
      'Esta cita ya existe!',
      'error'
    )
  }
  else if(info.status==4)
  {
    //esta cita ya fue creada
    swal(
      'Error',
      'Se ha alcazado el limite de citas para el dia seleccionado',
      'error'
    )
  }
  else
  {
    //pedir confirmacion de la cita llamar al server para pedir informacion de la clinica en la que ya tiene la cita
    //socket.emit('crear_cita',jsdata);
    swal({
      title: 'Esta seguro que desea crear la cita?',
      text: "Ya existe una cita en: "+info.jsdata.nombre_servicio+" en la unidad: "+info.statusnombre,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, guardar cita!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false
    }).then(function () {
      socket.emit('crear_cita',info.jsdata);

      }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
          swal(
            'Cancelada',
            'La cita ha sido cancelada',
            'error'
          )
        }
})
  }
});
socket.on('cita_exitosa',(data) =>{
  $('#selecciones').hide(200);
  $('#divBotonGuardar').hide(200);
  $('#tabla').show(200);
  swal(
    'Cita creada!',
    'La cita se ha creado con exito. En la fecha: '+data.fecha.substring(8,10)+"/"+data.fecha.substring(5,7)+"/"+data.fecha.substring(0,4)+'  Para la clinica: '+data.clinica,
    'success'
  )
  $('#btnNueva').show(300);
  $('#textoNueva').show(300);
  document.getElementById('download_txt').href=data.redirect;
  document.getElementById('download_txt').click();
    //window.open(data.redirect, "_blank");
});

socket.on('reimpresion_cita_exitosa',function(data) {
  document.getElementById('download_txt').href=data.redirect;
  document.getElementById('download_txt').click();
});

var ClinicaSeleccionada=0;
//inicio de citas
$("#btnGuardar").click( function()
        {
          //alert($('#clinicas_u').val().toString().substring(5,70));
            area = $('#area').val();
            medico= $('#medico').val();
            time= $('#horaCita').val();
            date= $('#fechaCita').val();
            clinica=$('#clinicas_u').val().toString().substring(0,4);
          if (area=="" || medico=="" || time=="" || date=="" || clinica=="" )
          {
            swal('Debe llenar todos los campos');
          }
          else
          {


            //mensaje
            swal({
              title: 'Desea crear la cita?',
              text: "Debe estar seguro de los datos del paciente!",
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Si, guardar cita!',
              cancelButtonText: 'No, cancelar!',
              confirmButtonClass: 'btn btn-success',
              cancelButtonClass: 'btn btn-danger',
              buttonsStyling: false
            }).then(function () {
              var jsdata={no_expediente:$('#nexpediente').val(),
              fecha:$('#fechaCita').val(),
              hora:$('#horaCita').val().replace('PM','').replace('AM',''),
              servicio:$('#area').val(),nombre_servicio:$('#area option:selected').text(),nombre_unidad:$('#clinicas_u').val().toString().substring(5,70),nombre_medico:$('#medico option:selected').text(),
              unidad:$('#clinicas_u').val().toString().substring(0,4),linea:linea_cliente,
              id_doctor:$('#medico').val()};

              console.log(jsdata);
              socket.emit('comprobar_cita',jsdata);

              }, function (dismiss) {
                // dismiss can be 'cancel', 'overlay',
                // 'close', and 'timer'
                if (dismiss === 'cancel') {
                  swal(
                    'Cancelada',
                    'La cita ha sido cancelada',
                    'error'
                  )
                }
})

            //fin mensaje

          }

});//fin boton guardar


var numero;
var longitud;
var area, time,date,medico,clinica;

$('#nexpediente').keypress(function(e){

tecla = (document.all) ? e.keyCode : e.which;

  //Tecla de retroceso para borrar, siempre la permite
  if (tecla==8){
      return true;
  }
  if(tecla==13)
  {
    numero = $('#nexpediente').val();
    longitud = numero.length;
    //validacion para campo del numero de carne
    if(longitud == 11 && longitud!=null){
      socket.emit('ver_expediente',$("#nexpediente").val());

    }//FIN DEL IF
    else
    {
      swal('Debe ingresar un numero de carné valido ejemplo: 20170050000');
      //$('#nexpediente').show(300);
      //socket.emit('comprobar_cita');
    }//FIN ELSE
  }

  // Patron de entrada, en este caso solo acepta numeros
  patron =/[0-9]/;
  tecla_final = String.fromCharCode(tecla);
  return patron.test(tecla_final);
});

  $('#selecciones').hide();
  $('#divBotonGuardar').hide();
  $('#tabla').hide();
  $('#btnNueva').hide();
  //funcion para el boton de busqueda
  $("#btnBuscar").click(function()
          {

            numero = $('#nexpediente').val();
            longitud = numero.length;
            //validacion para campo del numero de carne
            if(longitud == 11 && longitud!=null){
              socket.emit('ver_expediente',$("#nexpediente").val());


            }//FIN DEL IF
            else
            {
              //socket.emit('crear_cita');
              swal('Debe ingresar un numero de carné valido ejemplo: 20170050000');
              $('#nexpediente').show(300);
            }//FIN ELSE





          });//FIN FUNCION ONCLICK






});// en document ready
