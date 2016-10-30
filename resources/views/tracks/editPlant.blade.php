@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Truck in plant
          </h1>
   
        </section>






      <section class="content">

                         <div class="row">
            <!-- Left col -->
            <section class="col-lg-12 connectedSortable">
              <!-- Custom tabs (Charts with tabs)-->
              <div class="nav-tabs-custom">
                <!-- Tabs within a box -->
                <ul class="nav nav-tabs pull-right">
           
                  
                  <li><a href="#plant_archive" data-toggle="tab"> Archive </a></li>
                  <li><a href="#plant_out_trucks" data-toggle="tab"> Plant-Out Trucks </a></li>
                  <li class="active" ><a href="#plant_in_trucks" data-toggle="tab">Plant-In Trucks</a></li>



                  <li class="pull-left header"><i class="fa fa-truck"></i> Check In trucks</li>
                </ul>


                <div class="tab-content no-padding">

             <div class="chart tab-pane" id="plant_archive">
            <div class="box-body">



            @include('tracks.archive')

                </div><!-- end box-body -->
                </div><!--end transit customer -->



                <div class="chart tab-pane" id="plant_out_trucks">
                <div class="box-body">



                @include('tracks.plant_out_trucks')

                </div><!-- end box-body -->
                </div><!--end transit customer -->
                

                <div class="chart tab-pane active" id="plant_in_trucks" >
               <div class="box-body">


               @include('tracks.plant_in_trucks')


                    </div><!--end box-body -->

                  </div><!-- end nav section -->
                </div>
              </div><!-- /.nav-tabs-custom -->

          
            </section><!-- /.Left col -->

    </div><!-- end row table -->






</section>



          




@endsection