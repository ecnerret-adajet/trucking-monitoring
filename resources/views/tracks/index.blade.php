@extends('layouts.app')

@section('content')


        <section class="content-header">
          <h1>
            Dashboard
            <small>Trucks Status</small>
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
                  <li ><a href="#transit_plant" data-toggle="tab">Transit to plant</a></li>
                  <li><a href="#in_customer" data-toggle="tab">In customer</a></li>
                  <li><a href="#transit_customer" data-toggle="tab">Transit to customer</a></li>
                  <li class="active" ><a href="#in_plant" data-toggle="tab">In plant</a></li>



                  <li class="pull-left header"><i class="fa fa-map-o"></i> Overview</li>
                </ul>


                <div class="tab-content no-padding">
                  <!-- Morris chart - Sales -->
                  <div class="chart tab-pane" id="transit_plant">
                      <div class="box-body">


                       @include('truck-status.transit-plant')


                      </div>
                  </div>


                  <div class="chart tab-pane" id="in_customer">
                      <div class="box-body">


                  @include('truck-status.in-customer')


                      </div>
                  </div><!-- end in_cusotmer table -->

                <div class="chart tab-pane" id="transit_customer">
                <div class="box-body">


                @include('truck-status.transit-customer')


                </div><!-- end box-body -->
                </div><!--end transit customer -->
                

                <div class="chart tab-pane active" id="in_plant" >
               <div class="box-body">


                 @include('truck-status.in-plant')



                    </div><!--end box-body -->

                  </div>
                </div>
              </div><!-- /.nav-tabs-custom -->

          
            </section><!-- /.Left col -->

    </div><!-- end row table -->

    <div class="row">
    <div class="col-md-4">
             <div class="box box-default">
                <div class="box-header with-border">
                  <h3 class="box-title">Top Region</h3>
                  <div class="box-tools pull-right">
                    <button class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                    <button class="btn btn-box-tool" data-widget="remove"><i class="fa fa-times"></i></button>
                  </div>
                </div><!-- /.box-header -->
                <div class="box-body">
                 

          
          

 <div id="container">
<table id="datatable-destination" class="hide">
   <thead>
        <tr>
            <th></th>
            <th>Total</th>
        </tr>
    </thead>

    <tbody>
     @foreach($all_customers as $all_customer)
        <tr>
            <th>{{ $all_customer->destination }}</th>
            <td>
          {{ $all_customer->tracks->count() }}
            </td>
        </tr> 
     @endforeach
</tbody>
</table><!-- end table -->
</div><!-- end container datatable -->
               
                    
                   
                    
                    
                  
               


                </div><!-- /.box-body -->
          
              </div><!-- /.box -->
    </div><!-- end column -->

    <div class="col-md-4">
             <!-- PRODUCT LIST -->
              <div class="box box-default">
                <div class="box-header with-border">
                  <h3 class="box-title">Recently Deployed Trucks</h3>
                  <div class="box-tools pull-right">
                    <button class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                    <button class="btn btn-box-tool" data-widget="remove"><i class="fa fa-times"></i></button>
                  </div>
                </div><!-- /.box-header -->
                <div class="box-body">
                  <ul class="products-list product-list-in-box">
                  @foreach($trackings as $tracking)
                    <li class="item">
                      <div class="product-info">
                        <a href="javascript::;" class="product-title">
                       @foreach($tracking->customers as $customer)
                        {{$customer->customer_name}}
                       @endforeach
                        <span class="label label-warning pull-right">{{$tracking->created_at->diffForHumans()}}</span></a>
                        <span class="product-description">
                        @foreach($tracking->trucks as $truck)
                       Driver: {{$truck->driver}}
                        @endforeach
                        </span>
                      </div>
                    </li><!-- /.item -->
                  @endforeach

                  </ul>
                </div><!-- /.box-body -->
                <div class="box-footer text-center">
                  <a href="javascript::;" class="uppercase">View All Trucks</a>
                </div><!-- /.box-footer -->
              </div><!-- /.box -->


    </div><!-- end col-md-4 -->

    <div class="col-md-4">
          <!-- Info Boxes Style 2 -->
              <div class="info-box  bg-aqua">
                <span class="info-box-icon"><i class="ion ion-ios-paper-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Total Trucks</span>
                  <span class="info-box-number">{{ $trucks->count() }}</span>
                 
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->
              <div class="info-box  bg-aqua">
                <span class="info-box-icon"><i class="ion ion-ios-bolt-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Total Customer</span>
                  <span class="info-box-number">{{$customers->count()}}</span>
                  
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->

              <div class="info-box  bg-aqua">
                <span class="info-box-icon"><i class="ion ion-ios-people-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Total Users</span>
                  <span class="info-box-number">{{ $users->count()}}</span>
                  
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->

                 <div class="info-box  bg-green">
                <span class="info-box-icon"><i class="ion ion-ios-timer-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Available Trucks</span>
                  <span class="info-box-number">
                  @foreach($schedules->slice(2,1) as $schedule)
                          {{ $schedule->trucks->count() }}
                      @endforeach
                  </span>
                  
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->


                 <div class="info-box  bg-red">
                <span class="info-box-icon"><i class="ion ion-ios-gear-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Unavailable trucks</span>
                  <span class="info-box-number">
                  @foreach($schedules->slice(1,1) as $schedule)
                          {{ $schedule->trucks->count() }}
                      @endforeach
                  </span>
                  
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->
         

              

    </div>

    </div><!-- end row graph -->



 <!-- show trucks and customer data -->
 @foreach($tracks as $track)
<!-- modal edit form -->
<div class="modal fade bs-edit{{$track->id}}-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">View details</h4>
      </div>
      <div class="modal-body">
              <div class="row">
        <div class="col-md-12">
                <div class="panel-body"> 

<h3>Customer Information</h3>

<table class="table  table-hover table-responsive" width="100%">
 <tbody>
    <tr>
      <td class="text-uppercase col-md-6">Customer Name:</td>
      <td>   @foreach($track->customers as $customer)
                            {{ $customer->customer_name }}
                         @endforeach</td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6">Origin:</td>
      <td>   @foreach($track->customers as $customer)
                            {{ $customer->origin }}
                         @endforeach</td>
      
    </tr>

        <tr>
      <td class="text-uppercase col-md-6">Destination:</td>
      <td>   @foreach($track->customers as $customer)
                            {{ $customer->destination }}
                         @endforeach</td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6">Estimated Time Travel:</td>
      <td>   @foreach($track->customers as $customer)
                            {{ $customer->time_to_customer }} hours
        @endforeach
        </td>
      
    </tr>

    


 

    
  </tbody>
</table> 


<h3>Truck Information</h3>



<table class="table table-hover table-responsive">
 <tbody>
    <tr>
      <td class="text-uppercase col-md-6">Plate Number:</td>
      <td>   @foreach($track->trucks as $truck)
                            {{ $truck->plate_no }}
                         @endforeach</td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6">Location</td>
      <td>   @foreach($track->trucks as $truck)
                            {{ $truck->location }}
                         @endforeach</td>
      
    </tr>

        <tr>
      <td class="text-uppercase col-md-6">Driver Name:</td>
      <td>   @foreach($track->trucks as $truck)
                            {{ $truck->driver }}
                         @endforeach</td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6">Truck type:</td>
      <td>   @foreach($track->trucks as $truck)
                            {{ $truck->truck_type }} 
        @endforeach
        </td>
      
    </tr>

    

    


 

    
  </tbody>
</table>          
<h3>Progress Meter</h3>                  
<div class="progress progress-striped active">

  <div class="progress-bar" style="{{ ($track->out_customer != '-0001-11-30 00:00:00' ? 'width:100%' : '')  }}"></div>
 
</div>
 


                    
                </div>
        </div>
    </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          
               
      </div>

    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->      
       @endforeach
<!-- end show data for trucks and customer -->
    


     
    
    
</section>


 

@endsection

