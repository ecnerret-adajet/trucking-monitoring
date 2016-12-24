@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Trucks Management
            <small>All Trucks</small>
          </h1>
   
        </section>






      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Truck History Log</h3>
            </div><!-- /.box-header -->

                <div class="box-body" id="customer-main">


                <div class="row">

                <div class="col-md-4">
                <span>PLATE NUMBER</span>
                <p>
                {{ $truck->plate_no }}
                </p>
                </div>

                <div class="col-md-8">
                    <div class="row">
                        <div class="col-md-6">
                          <span>VENDOR NAME</span>
                          <p>
                          {{$truck->vendor_name}}
                          </p>
                        </div>
                        <div class="col-md-6">
                          <span>VEHICLE TYPE</span>
                          <p>
                            {{$truck->vehicle_type}}
                          </p>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                          <span>CAPACITY</span>
                          <p>
                          {{$truck->capacity}}
                          </p>
                        </div>

                        <div class="col-md-6">
                          <span>CONTACT NUMBER</span>
                          <p>
                          {{$truck->phone}}
                          </p>
                        </div>
                    </div>
                </div>

                </div>

                <hr/>

                <div class="row">
                    <div class="col-md-12">
                        <table class="table">
                              <thead>
                                  <tr>
                                      <th>Plant in</th>
                                      <th>Plant out</th>
                                      <th>Customer in</th>
                                      <th>Customer out</th>
                                      <th>Back plant</th>
                                      <th>Time Travel</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  @foreach($truck->tracks as $track)
                                      <tr>
                                          <td>
                                             {{  ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '' : $track->dispatch->toFormattedDateString().' - '   ) }} 
                                              {{  ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->dispatch->format('h:i:s A')   ) }}
                                          </td>
                                          <td>
                                              {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '' : $track->out_plant->toFormattedDateString().' - '   ) }} 
                                              {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->out_plant->format('h:i:s A')   ) }}
                                          </td>                                          
                                          <td>
                                              {{  ($track->in_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '' : $track->in_customer->toFormattedDateString().' - '   ) }} 
                                              {{  ($track->in_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->in_customer->format('h:i:s A')   ) }}

                                          </td>                           
                                          <td>
                                              {{  ($track->out_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '' : $track->out_customer->toFormattedDateString().' - '   ) }} 
                                              {{  ($track->out_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->out_customer->format('h:i:s A')   ) }} 
                                          </td>
                                          <td>
                                              {{  ($track->back_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '' : $track->back_plant->toFormattedDateString().' - '   ) }} 
                                              {{  ($track->back_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->back_plant->format('h:i:s A')   ) }}
                                          </td>                   
                                           <td>
                                            {{  ($track->back_plant == '-0001-11-30 00:00:00' || $track->dispatch == '-0001-11-30 00:00:00'  ? ($track->dispatch->diffInHours($base_time) >= 407835 ? 'N/A' : $track->dispatch->diffInHours($base_time) )  : $track->dispatch->diffInHours($track->back_plant)) }}
                                          </td>                                      
                                        </tr>
                                  @endforeach
                              </tbody>                          
                        </table>
                    </div>
                </div>

                

                   



                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection