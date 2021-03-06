@extends('layouts.app')

@section('content')


        <section class="content-header">
          <h1>
            Dashboard
            <small>Trucks Status</small>
          </h1>
      

        </section>


             <div class="row">
          <div class="col-md-12">
        @foreach($tracks as $track)
        @if(  $track->help != 1 )
        @else

         <div class="alert alert-dismissible alert-danger">
  <button type="button" class="close" data-dismiss="alert">&times;</button>
   @foreach($track->trucks as $truck)
  <strong>
 
   Truck <span style="color: #000"> {{$truck->plate_no}} </span> has an emergency 
  
  </strong>, 
  
  please attend immediately number <span style="color: #000"> 

  <button class="pull-right btn btn-sm btn-primary" 
          style="position:absolute; right: 100px; top: 8px;"
          data-toggle="modal" 
          data-target=".bs-confirm{{$track->id}}-modal-lg"
  >
  Mark as resolve
  </button>  

  </span>

  @endforeach 
</div>
       
        @endif
           @endforeach
          </div>
          </div>


          <section class="content">


          <div class="row">
              <div class="col-md-3">
                     <div class="info-box  bg-aqua">
                <span class="info-box-icon"><i class="ion ion-ios-paper-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Total Trucks</span>
                  <span class="info-box-number">{{ $trucks->count() }}</span>
                 
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->
              </div>

              <div class="col-md-3">
                  <div class="info-box  bg-aqua">
                <span class="info-box-icon"><i class="ion ion-ios-bolt-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Total Customer</span>
                  <span class="info-box-number">{{$customers->count()}}</span>
                  
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->


              </div>

              <div class="col-md-3">
                              <div class="info-box  bg-aqua">
                <span class="info-box-icon"><i class="ion ion-ios-people-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Total Users</span>
                  <span class="info-box-number">{{ $users->count()}}</span>
                  
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->

              </div>


              <div class="col-md-3">
                <div class="info-box  bg-aqua">
                <span class="info-box-icon"><i class="ion ion-ios-people-outline"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">Drivers</span>
                  <span class="info-box-number">{{ $drivers->count()}}</span>
                  
                </div><!-- /.info-box-content -->
              </div><!-- /.info-box -->

              </div>

          </div>


  
          <div class="row">
            <!-- Left col -->
            <section class="col-lg-12 connectedSortable">
              <!-- Custom tabs (Charts with tabs)-->
              <div class="nav-tabs-custom">
                <!-- Tabs within a box -->
                <ul class="nav nav-tabs pull-right">
                  <li class="active" ><a href="#in_plant" data-toggle="tab">Dispatch Trucks</a></li>



                  <li class="pull-left header"><i class="fa fa-map-o"></i> Hauler Overview</li>
                </ul>


                <div class="tab-content no-padding">
                  <!-- Morris chart - Sales -->
           
                

                <div class="chart tab-pane active" id="in_plant" >
               <div class="box-body">


                 @include('truck-status.in-plant')

                 @include('truck-status.search')



                    </div><!--end box-body -->

                  </div>
                </div><!-- end tab content -->
              </div><!-- /.nav-tabs-custom -->

          
            </section><!-- /.Left col -->

    </div><!-- end row table -->

    <div class="row">


    <div class="col-md-4">

              <div class="row">
            <!-- Left col -->
            <section class="col-lg-12 connectedSortable">
              <!-- Custom tabs (Charts with tabs)-->
              <div class="nav-tabs-custom">
                <!-- Tabs within a box -->
                <ul class="nav nav-tabs pull-right">
                  <li ><a href="#weekly" data-toggle="tab" style="font-size: 10px">WEEKLY</a></li>
                  <li><a href="#monthly" data-toggle="tab" style="font-size: 10px">MONTHLY</a></li>
                  <li class="active"><a href="#all" data-toggle="tab" style="font-size: 10px">ALL</a></li>
           



                  <li class="pull-left header" style="font-size: 18px;"><i class="fa fa-map-o"></i> Region</li>
                </ul>


                <div class="tab-content no-padding">
                  <!-- Morris chart - Sales -->
                  <div class="chart tab-pane " id="weekly">
                      <div class="box-body">

                       <h4 class="text-center" style="color: grey;">
                    Coming Soon
                    </h4>
                      </div>
                  </div>


                  <div class="chart tab-pane" id="monthly">
                      <div class="box-body">


                    <h4 class="text-center" style="color: grey;">
                    Coming Soon
                    </h4>


                      </div>
                  </div><!-- end in_cusotmer table -->

                <div class="chart tab-pane active" id="all">
                <div class="box-body">

                                  <table class="table no-border">
                  @foreach($top_region as $top)
                  <tr>
                      <td>{{$top->customer_name}}</td>
                      <td>{{$top->tracks->count()}}</td>
                  </tr> 
                  @endforeach
                </table>


                       <a class="btn btn-default btn-sm btn-block" href="">
                See More
                </a>
                


                </div><!-- end box-body -->
                </div><!--end transit customer -->
                

          
                </div><!-- end tab content -->
              </div><!-- /.nav-tabs-custom -->

          
            </section><!-- /.Left col -->

    </div><!-- end row table -->

    </div><!-- end col-md-4 -->


     <div class="col-md-4">

           <div class="row">
            <!-- Left col -->
            <section class="col-lg-12 connectedSortable">
              <!-- Custom tabs (Charts with tabs)-->
              <div class="nav-tabs-custom">
                <!-- Tabs within a box -->
                <ul class="nav nav-tabs pull-right">
                  <li ><a href="#weekly_driver" data-toggle="tab" style="font-size: 10px">WEEKLY</a></li>
                  <li><a href="#monthly_driver" data-toggle="tab" style="font-size: 10px">MONTHLY</a></li>
                  <li class="active"><a href="#all_driver" data-toggle="tab" style="font-size: 10px">ALL</a></li>
           

                  <li class="pull-left header" style="font-size: 18px;"><i class="fa fa-id-card-o"></i> Driver</li>
                </ul>


                <div class="tab-content no-padding">
                  <!-- Morris chart - Sales -->
                  <div class="chart tab-pane" id="weekly_driver">
                      <div class="box-body">

                            <h4 class="text-center" style="color: grey;">
                    Coming Soon
                    </h4>
                            
                      </div>
                  </div>


                  <div class="chart tab-pane" id="monthly_driver">
                      <div class="box-body">


                    <h4 class="text-center" style="color: grey;">
                    Coming Soon
                    </h4>


                      </div>
                  </div><!-- end in_cusotmer table -->

                <div class="chart tab-pane active" id="all_driver">
                <div class="box-body">


                <table class="table no-border">
                  @foreach($top_drivers as $top_driver)
                  <tr>
                      <td>
                      @forelse($top_driver->drivers as $driver)
                        {{$driver->name}}
                      @empty
                        NO DRIVER
                      @endforelse
                      </td>
                      <td>{{$top_driver->tracks->count()}}</td>
                  </tr> 
                  @endforeach
                </table>


                       <a class="btn btn-default btn-sm btn-block" href="">
                See More
                </a>


                </div><!-- end box-body -->
                </div><!--end transit customer -->
                

          
                </div><!-- end tab content -->
              </div><!-- /.nav-tabs-custom -->

          
            </section><!-- /.Left col -->

    </div><!-- end row table -->


    </div><!-- end col-md-4 -->




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
                          <div class="row">
                                  <div class="col-md-2">
                            @foreach($tracking->trucks as $truck)
                                   @forelse($truck->drivers as $driver)
                          <img class="img-circle" style="width: 50px; height: auto" src="{{asset('img/drivers/'.$driver->avatar)}}">
                                   @empty
                          <img class="img-circle" style="width: 50px; height: auto" src="{{asset('img/drivers/avatar.png')}}">
                                   @endforelse
                              @endforeach

                                  </div>

                                  <div class="col-md-10">
                                             <a href="javascript::;" class="product-title">
                       @foreach($tracking->customers as $customer)
                                <span  style="color: #000 ! important" > 
                               {{str_limit($customer->customer_name, 20)}}
                               </span>
                       @endforeach
                        <span class="label label-warning pull-right">{{$tracking->created_at->diffForHumans()}}</span>
                      </a>
                            <span class="product-description">
                              @foreach($tracking->trucks as $truck)
                                   @forelse($truck->drivers as $driver)
                                         {{$driver->name}}
                                   @empty
                                        NO DRIVER
                                   @endforelse
                              @endforeach
                            </span>
                                  </div>

                          </div>

                     
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



   

    </div><!-- end row graph -->



 <!-- show trucks and customer data -->
 @foreach($tracks as $track)
<!-- modal edit form -->
<div class="modal fade bs-edit{{$track->id}}-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <span class="modal-title">HAULER DETAILS</span>
      </div>
      <div class="modal-body">
              <div class="row">
        <div class="col-md-12">
                <div class="panel-body"> 





  <ul class="nav nav-tabs">
  <li class="active"><a href="#customer-information-{{$track->id}}" data-toggle="tab" aria-expanded="true"><i class="fa fa-user" aria-hidden="true"></i> Customer Information</a></li>
  <li class=""><a href="#trucks-information-{{$track->id}}" data-toggle="tab" aria-expanded="false"><i class="fa fa-truck" aria-hidden="true"></i> Truck Information</a></li>
</ul>
<div id="myTabContent" class="tab-content">
  <div class="tab-pane fade active in" id="customer-information-{{$track->id}}">
    <p style="padding: 10px">


<table class="table  table-hover table-responsive" width="100%">
 <tbody>
 @foreach($track->customers as $customer)
    <tr>
      <td class="text-uppercase col-md-6"><strong>Customer Name:</strong></td>
      <td>   
          {{ $customer->customer_name }}
       </td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6"><strong>Origin:</strong></td>
      <td>   
              {{ $customer->origin }}
        </td>
      
    </tr>

        <tr>
      <td class="text-uppercase col-md-6"><strong>Destination:</strong></td>
      <td>  
      {{ $customer->destination }}
       </td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6"><strong>Estimated Time Travel:</strong></td>
      <td>   
  {{ $customer->total_hours }} hours
     
        </td>
      
    </tr>
 @endforeach
  
  </tbody>
</table> 


    </p>
  </div>
  <div class="tab-pane fade" id="trucks-information-{{$track->id}}">
   <p style="padding: 10px">

<table class="table table-hover table-responsive">
 <tbody>
 @foreach($track->trucks as $truck)

    <tr>
      <td class="text-uppercase col-md-6"><strong>Plate Number:</strong></td>
      <td>   
          {{ $truck->plate_no }}
      </td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6"><strong>Location:</strong></td>
      <td>  
      {{ $truck->location }}
      </td>
      
    </tr>

        <tr>
      <td class="text-uppercase col-md-6"><strong>Driver Name:</strong></td>
      <td>  
          {{ $truck->driver }}
        </td>
      
    </tr>

      <tr>
      <td class="text-uppercase col-md-6"><strong>Phone Number:</strong></td>
      <td>  
          {{ $truck->phone }}
        </td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6"><strong>Truck type:</strong></td>
      <td>   

     {{ $truck->truck_type }} 
        
        </td>
      
    </tr>

      <tr>
      <td class="text-uppercase col-md-6"><strong>Vendor Name:</strong></td>
      <td>   

     {{ $truck->vendor_name }} 
        
        </td>
      
    </tr>

    <tr>
      <td class="text-uppercase col-md-6"><strong>Vendor Name:</strong></td>
      <td>   

     {{ $truck->subcon_vendor }} 
        
        </td>
      
    </tr>

       <tr>
      <td class="text-uppercase col-md-6"><strong>Vehicle Type:</strong></td>
      <td>   

     {{ $truck->vehicle_type }} 
        
        </td>
      
    </tr>


    @endforeach
  </tbody>
</table>          


   </p>
  </div>
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





<!-- Mark an truck as safe method modal -->
<div class="modal fade bs-confirm{{$track->id}}-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Mark as safe</h4>
      </div>
      <div class="modal-body">
              <div class="row">
        <div class="col-md-12">
        <div class="panel-body text-center"> 
    
        <h4>  
           Are you sure you want to mark as safe?
        </h4>
    
     {!! Form::open(['method' => 'PATCH', 'action' =>                                    ['TracksController@markSafe', $track->id]  ]) !!}
      {!! csrf_field() !!}
                                        
    </div>
        </div>
    </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Confirm</button>
           
      </div>
      {!! Form::close() !!}
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  
<!-- end mark an truck as safe modal -->

       @endforeach
<!-- end show data for trucks and customer -->




  
     
    
    
</section>


 

@endsection

