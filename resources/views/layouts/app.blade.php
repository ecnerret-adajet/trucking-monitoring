<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">

    <title>Trucking Monitoring</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:100,300,400,700">
    <!-- flash nice rendering -->
    <link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href='//fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700' rel='stylesheet'>
    <!-- All styles   -->
    <link href="{{ asset('/css/all.css') }}" rel="stylesheet" >
    <link rel="stylesheet" href="{{asset('/css/loader.css')}}">      
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
   
 <body class="skin-blue sidebar-mini">
  <div id="load_screen">
 <div id="loading">

   <div  class="coffee_cup"></div>
   <div class="text-center loader-style">Loading...</div>

 </div>
 </div>

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
                <li>
                <a href="{{url('/logout')}}">
                  <strong>
                  <i class="ion-android-exit" style="font-size: 15px; margin-right: 5px;" aria-hidden="true"></i> Sign Out
                  </strong>
                </a>
                </li>
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
              <img src="{{asset('/img/avatars/'.Auth::user()->avatar)}}"  class="img-circle" alt="User Image" />
            </div>
            <div class="pull-left info">
              <p>{{ Auth::user()->name }}</p>
            </div>
      
          </div>
    
          <!-- sidebar menu: : style can be found in sidebar.less -->
          <ul class="sidebar-menu">
            <li class="header">MAIN NAVIGATION</li>
            @role('Personnel')
              <li><a href="{{url('/edit-plant')}}"><i class="fa fa-truck"></i> <span>Truck list</span></i></a></li>
              @endrole
              
            @role(['Dispatcher'])
            <li><a href="{{url('/tracks')}}"><i class="fa fa-dashboard"></i> <span>Dashboard</span></i></a></li>
            <li><a href={{url('/tracks/create')}} ><i class="fa fa-plus" ></i> <span>Deploy truck</span></a></li>   
             @endrole     

            @role(['Monitoring'])
            <li><a href="{{url('/tracks')}}"><i class="fa fa-dashboard"></i> <span>Dashboard</span></i></a></li>
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
                 
              </ul>
            </li>
             @endrole  


            @role(['Administrator'])  
                <li><a href="{{url('/tracks')}}"><i class="fa fa-dashboard"></i> <span>Dashboard</span></i></a></li>
                <li><a href={{url('/tracks/create')}} ><i class="fa fa-plus" ></i> <span>Deploy truck</span></a></li>   
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
                 
              </ul>
            </li>
            <li><a href="{{url('/summary')}}"><i class="fa fa-line-chart"></i> <span>Reports</span></a></li>

               <li class="treeview">
              <a href="#">
                <i class="fa fa-unlock-alt"></i> <span>User</span> <i class="fa fa-angle-left pull-right"></i>
              </a>
              <ul class="treeview-menu">
                <li><a href="{{url('/users')}}"><i class="fa fa-circle-o"></i>All User</a></li>
                <li><a href="{{url('/roles')}}"><i class="fa fa-circle-o"></i>User roles</a></li>
                 
              </ul>
            </li>
            <li><a href="#"><i class="fa fa-book"></i> <span>Documentation</span></a></li>

            @endrole
         


            



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
   <script src="{{asset('js/jquery.min.js')}}"></script>
   @include('flashy::message')
   <script src="{{asset('js/bootstrap.min.js')}}"></script>


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

          <!-- AdminLTE App -->
  <script src="{{asset('/js/app.js')}}"></script>
    <!-- report js for charts  -->
  <script src="{{ asset('js/report.js') }}"></script>
  <script src="{{ asset('js/custom.js') }}"></script>

    <script src="{{asset('/plugins/morris/morris.min.js')}}"></script>
    <!-- Sparkline -->
    <script src="{{asset('/plugins/sparkline/jquery.sparkline.min.js')}}"></script>
    <!-- jQuery Knob Chart -->
    <script src="{{asset('/plugins/knob/jquery.knob.js')}}"></script>
    <!-- daterangepicker -->
    <script src="{{asset('/plugins/daterangepicker/daterangepicker.js')}}" ></script>
    <!-- datepicker -->
    <script src="{{asset('/plugins/datepicker/bootstrap-datepicker.js')}}"></script>
    <!-- Slimscroll -->
    <script src="{{asset('/plugins/slimScroll/jquery.slimscroll.min.js')}}"></script>
    <!-- FastClick -->
    <script src="{{asset('/plugins/fastclick/fastclick.min.js')}}"></script>
    <!--select 2 -->
    <script src="{{ asset('/js/select2.min.js') }}"></script>
    <!--laravel boostrap modal form -->
     <script src="{{ asset('/js/laravel-bootstrap-modal-form.js') }}"></script>
      <!-- Highchartjs -->
     <script src="{{asset('js/highcharts.js')}}"></script>
    <script src="{{asset('js/data.js')}}"></script>
    <script src="{{asset('js/exporting.js')}}"></script>
    <script src="{{asset('js/export-csv.js')}}"></script>
    <script src="{{asset('js/highcharts-more.js')}}"></script>
       <!-- InputMask -->
    <script src="{{asset('/plugins/input-mask/jquery.inputmask.js')}}" ></script>
    <script src="{{asset('/plugins/input-mask/jquery.inputmask.date.extensions.js')}}" ></script>
    <script src="{{asset('/plugins/input-mask/jquery.inputmask.extensions.js')}}"></script>
     <!-- filesystem -->
     <script src="{{asset('/js/bootstrap-filestyle.min.js')}}" type="text/javascript"></script>


     <script type="text/javascript">
       window.addEventListener("load", function() {
        var load_screen = document.getElementById("load_screen");
        document.body.removeChild(load_screen);
       });
     </script>

      @include ('footer')
      @yield('footer')
    
    {{-- <script src="{{ elixir('js/app.js') }}"></script> --}}
</body>
</html>
