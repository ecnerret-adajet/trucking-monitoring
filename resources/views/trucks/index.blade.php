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
              <h3 class="box-title">All Trucks</h3>
            </div><!-- /.box-header -->

                <div class="box-body" id="customer-main">

                

                   <table  id="list-truck" class="table table-bordered  table-hover table-padding">
                <thead>
                      <tr>
                          <th></th>    
                          <th>LOCATION</th>    
                          <th>DRIVER NAME</th>    
                          <th>PLATE NO</th>    
                          <th>TRUCK TYPE</th>    
                          <th>VENDOR NAME</th>    
                          <th>HISTORY</th> 
                          <th class="text-center">ACTION</th>
                      

                     </tr>       
                </thead> 
            <tfoot>
                 <tr>
                          <th></th>    
                          <th>LOCATION</th>    
                          <th>DRIVER NAME</th>    
                          <th>PLATE NO</th>    
                          <th>TRUCK TYPE</th>    
                          <th>VENDOR NAME</th>    
                          <th>HISTORY</th> 
                          <th class="text-center">ACTION</th>
                         
               </tr>
        </tfoot>   
                    
                    
                    @foreach($trucks as $truck)
                    <tr>
                      <td><img class="img-responsive img-circle" style="width: 35px; height:auto;" src="{{asset('/avatars/placeholder.png')}}"></td>
                      <td>{{$truck->location}}</td>   
                      <td>{{$truck->driver}}</td>   
                      <td>{{$truck->plate_no}}</td>   
                      <td>{{$truck->truck_type}}</td>   
                      <td>{{$truck->vendor_name}}</td>   
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