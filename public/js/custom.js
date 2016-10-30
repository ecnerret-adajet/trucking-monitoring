
$(function () {

 $('#list-truck').DataTable();
 $('#track-plant').DataTable();
  $('#transit-customer').DataTable();
  $('#track-customer').DataTable();
 $('#transit-plant').DataTable();
  $('#track-customer').DataTable();

    $('#report-tracks').DataTable( {
        dom: "<'row table-style-custom'<'col-sm-6'><'col-sm-6 text-right'B>>"+"<'row'<'col-sm-6'l><'col-sm-6'f>>R" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-5'i><'col-sm-7'p>>", 
        buttons: [
          
            { extend: 'excelHtml5', className: 'btn-sm btn-success text-uppercase' },
            { extend: 'csvHtml5', className: 'btn-sm btn-success text-uppercase' },
            { extend: 'pdfHtml5', className: 'btn-sm btn-success text-uppercase' }
        ]
    } );


       $('#report-tracks-2').DataTable( {
        dom: "<'row table-style-custom'<'col-sm-6'><'col-sm-6 text-right'B>>"+"<'row'<'col-sm-6'l><'col-sm-6'f>>R" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-5'i><'col-sm-7'p>>", 
        buttons: [
          
            { extend: 'excelHtml5', className: 'btn-sm btn-success text-uppercase' },
            { extend: 'csvHtml5', className: 'btn-sm btn-success text-uppercase' },
            { extend: 'pdfHtml5', className: 'btn-sm btn-success text-uppercase' }
        ]
    } );

           $('#report-tracks-3').DataTable( {
        dom: "<'row table-style-custom'<'col-sm-6'><'col-sm-6 text-right'B>>"+"<'row'<'col-sm-6'l><'col-sm-6'f>>R" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-5'i><'col-sm-7'p>>", 
        buttons: [
          
            { extend: 'excelHtml5', className: 'btn-sm btn-success text-uppercase' },
            { extend: 'csvHtml5', className: 'btn-sm btn-success text-uppercase' },
            { extend: 'pdfHtml5', className: 'btn-sm btn-success text-uppercase' }
        ]
    } );


    $('#report-tracks-4').DataTable( {
        dom: "<'row table-style-custom'<'col-sm-6'><'col-sm-6 text-right'B>>"+"<'row'<'col-sm-6'l><'col-sm-6'f>>R" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-5'i><'col-sm-7'p>>", 
        buttons: [
          
            { extend: 'excelHtml5', className: 'btn-sm btn-success text-uppercase' },
            { extend: 'csvHtml5', className: 'btn-sm btn-success text-uppercase' },
            { extend: 'pdfHtml5', className: 'btn-sm btn-success text-uppercase' }
        ]
    } );


    // input mask
      $("[data-mask]").inputmask();

     //ajax display
          $('input').keyup(function() {
        $.ajax({
            method: 'get',
            url: 'app/trucks' + $(this).val(),
            dataType: "json",
            success: function(data){
               $('#name').text(data.name);           
            },
            statusCode: {
                500: function() {
                    // 
                },
                422: function(data) {
                    // 
                }
            }
        });         
      });


  //filesystem

     $(":file").filestyle({size: "sm", buttonName: "btn-primary", buttonBefore: true});

   //select2 plugin

    $(".select").select2({
        placeholder: "Select a plate number",
        allowClear: true,
    });


    $(".multiple-select").select2();


 //Resolve conflict in jQuery UI tooltip with Bootstrap tooltip
    $.widget.bridge('uibutton', $.ui.button);



});//end