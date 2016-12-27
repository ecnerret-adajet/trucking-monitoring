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
              <h3 class="box-title">All Trucks
              <a class="btn btn-primary" href="{{url('trucks/create')}}">
              Add Truck
              </a>
              </h3>
            </div><!-- /.box-header -->

                <div class="box-body" id="customer-main">

                

                   <table  id="list-truck" class="table table-bordered  table-hover table-padding">
                <thead>
                      <tr>
                          <th>OPERATOR</th>    
                          <th>DRIVER NAME</th>    
                          <th>PLATE NO</th>    
                          <th>ASIGNMENT</th>    
                          <th>TRUCK TYPE</th>    
                          <th>COUNT</th> 
                          <th class="text-center">ACTION</th>                      
                     </tr>       
                </thead> 
            <tfoot>
                      <tr>
                          <th>OPERATOR</th>    
                          <th>DRIVER NAME</th>    
                          <th>PLATE NO</th>    
                          <th>ASIGNMENT</th>    
                          <th>TRUCK TYPE</th>    
                          <th>COUNT</th> 
                          <th class="text-center">ACTION</th>                      
                     </tr>    
        </tfoot>   
                    
                    
                    @foreach($trucks as $truck)
                    <tr>
                      <td>{{$truck->operator}}</td>   
                      <td>
                      @foreach($truck->drivers as $driver)
                        {{$driver->name}}
                      @endforeach
                      </td>   
                      <td>{{$truck->plate_no}}</td>   
                      <td>
                      @foreach($truck->assignments as $assignment)
                        {{$assignment->name}}
                      @endforeach
                      </td>   
                      <td>{{$truck->vehicle_type}}</td>   
                      <td>
                        <a class="btn btn-primary" href="{{url('trucks/'.$truck->id)}}">
                        <i class="fa fa-history" aria-hidden="true"></i>
                        History Log
                        </a>
                      </td>   
                      <td width="20%">

                      <div class="btn-group btn-group-justified">
                          <a class="btn btn-info" href="{{url('trucks/'.$truck->id.'/edit')}}"> 
                             <i class="fa fa-cog action" aria-hidden="true" style="color: #fff;"></i> Edit
                          </a>
                        @role('Administrator')
                            <a class="btn btn-primary"  href="#">
                            <i class="fa fa-trash action" aria-hidden="true" style="color: #fff;"></i>
                            Delete
                            </a>
                        @endrole
                      </div>

                      

                      </td>
                     
                        
                      </tr>
                    @endforeach
                    
                </table>




                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection