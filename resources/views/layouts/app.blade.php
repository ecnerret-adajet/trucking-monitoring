<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">

    <title>Trucking Monitoring</title>

    <!-- Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css" integrity="sha384-XdYbMnZ/QjLh6iI4ogqCTaIjrFk87ip+ekIjefZch0Y+PvJ8CDYtEs1ipDmPorQ+" crossorigin="anonymous">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:100,300,400,700">

     <!-- Ionicons 2.0.0 -->
    <link href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css" />

    <!-- Styles -->

    <!-- Datatables styles   -->
    <link href="{{ asset('/css/dataTables.tableTools.css') }}" rel="stylesheet" >
    <link href="{{ asset('/css/dataTables.bootstrap.min.css') }}" rel="stylesheet" />
    <link href="{{ asset('/css/responsive.bootstrap.min.css') }}" rel="stylesheet" />  
    <link href="{{ asset('/css/buttons.bootstrap.min.css') }}" rel="stylesheet" />  


        <!-- Theme style -->
    <link href="{{asset('css/skins/_all-skins.min.css')}}" rel="stylesheet" type="text/css" />
    <link href="{{ asset('css/AdminLTE.css') }}" rel="stylesheet"  />
    <link href="{{asset('plugins/iCheck/flat/blue.css')}}" rel="stylesheet" />
    <!-- Morris chart -->
    <link href="{{asset('plugins/morris/morris.css')}}" rel="stylesheet" />
  

    <!-- Date Picker -->
    <link href="{{asset('plugins/datepicker/datepicker3.css')}}" rel="stylesheet"  />
    <!-- Daterange picker -->
    <link href="{{asset('plugins/daterangepicker/daterangepicker-bs3.css')}}" rel="stylesheet"  />
    


    <!-- end theme style -->
  
    
    <link rel="stylesheet" href="{{asset('/css/bootstrap.min.css')}}">
   
    <link href="{{ asset('/css/select2.min.css') }}" rel="stylesheet" />
    <link href="{{ asset('/css/select2-bootstrap.min.css') }}" rel="stylesheet" />


    <link href="{{asset('/css/style.css')}}" rel="stylesheet">
    
          



    {{-- <link href="{{ elixir('css/app.css') }}" rel="stylesheet"> --}}

    <style>
        body {
            font-family: 'Lato';
            font-weight: 400;
            font-size: 13px;
        }

        .fa-btn {
            margin-right: 6px;
        }
    </style>
  

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
   
 <body class="skin-blue sidebar-mini">
    <div class="wrapper">

      <header class="main-header">
        <!-- Logo -->
        <div class="logo">
    
         <span class="pull-left">
         <a href="#"  data-toggle="offcanvas" role="button">
         <i class="ion-ios-settings"></i>
         </a>
         </span>


          <span class="">
       Trucking Monitoring
         </span>

        </div>
        <!-- Header Navbar: style can be found in header.less -->
        <nav class="navbar navbar-static-top" role="navigation">
      


          <div class="navbar-custom-menu">
            <ul class="nav navbar-nav">
           
             
              <!-- User Account: style can be found in dropdown.less -->
              <li class="dropdown user user-menu">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                  <img src="{{asset('/avatars/'.Auth::user()->avatar)}}" class="user-image" alt="User Image" />
                  <span class="hidden-xs">{{ Auth::user()->name }}</span>
                </a>
                <ul class="dropdown-menu" style="width:200px; border-left: 1px solid #95a5a6; border-bottom: 1px solid #95a5a6; border-radius:0;">
                  <!-- User image -->
                     <li><a href="#"><i class="fa fa-cog" aria-hidden="true"></i> Account Settings</a></li>
                    <li><a href="{{url('/logout')}}"><i class="fa fa-sign-out" aria-hidden="true"></i> Sign Out</a></li>

                </ul>
              </li>
             

            </ul>
          </div>
        </nav>
      </header>
      <!-- Left side column. contains the logo and sidebar -->
      <aside class="main-sidebar">
        <!-- sidebar: style can be found in sidebar.less -->
        <section class="sidebar">
          <!-- Sidebar user panel -->
          <div class="user-panel">
            <div class="pull-left image">
              <img src="{{asset('/avatars/'.Auth::user()->avatar)}}"  class="img-circle" alt="User Image" />
            </div>
            <div class="pull-left info">
              <p>{{ Auth::user()->name }}</p>
            </div>
      
          </div>
          <!-- search form
          <form action="#" method="get" class="sidebar-form">
            <div class="input-group">
              <input type="text" name="q" class="form-control" placeholder="Search..." />
              <span class="input-group-btn">
                <button type="submit" name="search" id="search-btn" class="btn btn-flat"><i class="fa fa-search"></i></button>
              </span>
            </div>
          </form>
           -->
          <!-- sidebar menu: : style can be found in sidebar.less -->
          <ul class="sidebar-menu">
            <li class="header">MAIN NAVIGATION</li>


            <li><a href="{{url('/tracks')}}"><i class="fa fa-dashboard"></i> <span>Dashboard</span></i></a></li>
            <li><a href={{url('/tracks/create')}} ><i class="fa fa-plus" ></i> <span>Delivery truck</span></a></li>
            <li><a href={{url('/tracks/create')}} ><i class="fa fa-plus" ></i> <span>Pick-up truck</span></a></li>
            
               <li class="treeview">
              <a href="#">
                <i class="fa fa-heart"></i> <span>Manage Customer</span> <i class="fa fa-angle-left pull-right"></i>
              </a>
              <ul class="treeview-menu">
                <li><a href="{{url('/customers')}}"><i class="fa fa-circle-o"></i>All Customers</a></li>
                <li><a href="{{url('/customers/create')}}"><i class="fa fa-circle-o"></i>Add Customer</a></li>
              </ul>
            </li>
            <li class="treeview">
              <a href="#">
                <i class="fa fa-truck"></i> <span>Manage Trucks</span> <i class="fa fa-angle-left pull-right"></i>
              </a>
              <ul class="treeview-menu">
                <li><a href="{{url('/trucks')}}"><i class="fa fa-circle-o"></i>All Trucks</a></li>
                <li><a href="{{url('/trucks/create')}}"><i class="fa fa-circle-o"></i>Add Trucks</a></li>
                <li><a href="{{url('/trucks/create')}}"><i class="fa fa-circle-o"></i>Add Driver</a></li>
                  <li><a href="#"><i class="fa fa-circle-o"></i>Available Trucks</a></li>
                <li><a href="#"><i class="fa fa-circle-o"></i>For Repair Trucks</a></li>
              </ul>
            </li>
            <li><a href="{{url('/reports')}}"><i class="fa fa-line-chart"></i> <span>Reports</span></a></li>
            <li><a href="#"><i class="fa fa-unlock-alt"></i> <span>User</span></a></li>



            <li class="header">LABELS</li>
            <li><a href="#"><i class="fa fa-circle-o text-aqua"></i> <span>Complete</span></a></li>
            
           
            
            <li><a href="#"><i class="fa fa-circle-o text-red"></i> <span>Beyond ETA</span></a></li>

            
          </ul>
        </section>
        <!-- /.sidebar -->
      </aside>

      <!-- Content Wrapper. Contains page content -->
      <div class="content-wrapper">
       
    


                  @yield('content')

                 

    
       
    </div><!-- ./wrapper -->

      <footer class="main-footer">
        <div class="pull-right hidden-xs">
          <b>Version</b> 1
        </div>
        <strong>Copyright &copy; 2016 La Filipina Uy Gongco Group of Companies.</strong>
      </footer>


    <!-- JavaScripts -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js" integrity="sha384-I6F5OKECLVtK/BL+8iSLDEHowSAfUo76ZL9+kGAgTRdiByINKJaqTPH/QVNS1VDb" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>


       <!-- datatables   -->  
    <script src="{{ asset('js/jquery.dataTables.min.js') }}"></script>
    <script src="{{ asset('js/dataTables.responsive.min.js') }}"></script>
    <script src="{{ asset('js/responsive.bootstrap.min.js') }}"></script>
    <script src="{{ asset('js/jquery.dataTables.columnFilter.js') }}"></script>
    <script src="{{ asset('js/dataTables.tableTools.min.js') }}"></script>
    <script src="{{ asset('js/dataTables.bootstrap.min.js') }}"></script>
    <script src="{{ asset('js/dataTables.buttons.min.js') }}"></script>
    <script src="{{ asset('js/buttons.bootstrap.min.js') }}"></script>
    <script src="{{ asset('js/jszip.min.js') }}"></script>
    <script src="{{ asset('js/pdfmake.min.js') }}"></script>
    <script src="{{ asset('js/vfs_fonts.js') }}"></script>
    <script src="{{ asset('js/buttons.html5.min.js') }}"></script>



    <!-- theme javascript -->

    <!-- jQuery UI 1.11.4 -->
    <script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js" type="text/javascript"></script>



    <!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
    <script type="text/javascript">
      $.widget.bridge('uibutton', $.ui.button);
    </script>
    <!-- Morris.js charts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
    <script src="{{asset('/plugins/morris/morris.min.js')}}"></script>
    <!-- Sparkline -->
    <script src="{{asset('/plugins/sparkline/jquery.sparkline.min.js')}}"></script>
   

    <!-- jQuery Knob Chart -->
    <script src="{{asset('/plugins/knob/jquery.knob.js')}}"></script>
    <!-- daterangepicker -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.2/moment.min.js"></script>
    <script src="{{asset('/plugins/daterangepicker/daterangepicker.js')}}" ></script>
    <!-- datepicker -->
    <script src="{{asset('/plugins/datepicker/bootstrap-datepicker.js')}}"></script>
  
    <!-- Slimscroll -->
    <script src="{{asset('/plugins/slimScroll/jquery.slimscroll.min.js')}}"></script>
    <!-- FastClick -->
    <script src="{{asset('/plugins/fastclick/fastclick.min.js')}}"></script>
    <!-- AdminLTE App -->
    <script src="{{asset('/js/app.js')}}"></script>
   
   <!-- vue js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/1.0.26/vue.min.js"></script>
    <script src="{{asset('/js/customers-table.js')}}"></script>
    <script src="{{asset('/js/trucks-table.js')}}"></script>


    <!-- datapicker -->
     <script src="{{asset('/plugins/daterangepicker/daterangepicker.js')}}" type="text/javascript"></script>



    <!--end theme javascript -->


    <script src="{{asset('/js/app-theme.js')}}"></script>

    <script src="{{asset('/js/tables-data.js')}}"></script>

    <script src="{{ asset('/js/select2.min.js') }}"></script>

     <script src="{{ asset('/js/laravel-bootstrap-modal-form.js') }}"></script>

    
      <!-- Highchartjs -->
     <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/data.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="http://highcharts.github.io/export-csv/export-csv.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>


       <!-- InputMask -->
    <script src="{{asset('/plugins/input-mask/jquery.inputmask.js')}}" ></script>
    <script src="{{asset('/plugins/input-mask/jquery.inputmask.date.extensions.js')}}" ></script>
    <script src="{{asset('/plugins/input-mask/jquery.inputmask.extensions.js')}}"></script>
    
     
     <!-- filesystem -->
     <script src="{{asset('/js/bootstrap-filestyle.min.js')}}" type="text/javascript"></script>
       <script>
       $(":file").filestyle({size: "sm", buttonName: "btn-primary", buttonBefore: true});

     </script>



    
    <!-- report js for charts  -->
    <script src="{{ asset('js/report.js') }}"></script>



    
     @include ('footer')

      <script>    
    $(document).ready(function() {
    $('#list-truck').DataTable();
      });
    </script>

      <script>    
    $(document).ready(function() {
    $('#track-plant').DataTable();
      });
    </script>

     <script>    
    $(document).ready(function() {
    $('#transit-customer').DataTable();
      });
    </script>

    <script>    
    $(document).ready(function() {
    $('#track-customer').DataTable();
      });
    </script>

    <script>    
    $(document).ready(function() {
    $('#transit-plant').DataTable();
      });
    </script>
    
    <script>
    $(document).ready(function() {
    $('#track-customer').DataTable();
    } );
    </script>
    
 

       <script>
     $(document).ready(function() {
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
} );
    </script>

<script type="text/javascript">
      $(function () {

        $("[data-mask]").inputmask();
      });
    </script>


      <script>
    $(function () {
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
    });
  </script>





    
@yield('footer')
    
    {{-- <script src="{{ elixir('js/app.js') }}"></script> --}}
</body>
</html>
