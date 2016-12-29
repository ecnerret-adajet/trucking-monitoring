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
              @role(['Administrator'])
              <a class="btn btn-primary" href="{{url('trucks/create')}}">
              Add Truck
              </a>
              @endrole
              </h3>
            </div><!-- /.box-header -->

                <div class="box-body" id="customer-main">

                

                   <table  id="list-truck" class="table table-bordered  table-hover table-padding">
                <thead>
                      <tr>
                          <th>OPERATOR</th>    
                          <th>PLATE NO</th>    
                          <th>DRIVER NAME</th>  
                          <th>ASIGNMENT</th>    
                          <th>TRUCK TYPE</th>    
                          <th>STATUS</th>    
                          <th>ODOMETER</th>    
                          <th width="15%">ACTION</th>
                     </tr>       
                </thead> 
            <tfoot>
                         <tr>
                          <th>OPERATOR</th>    
                          <th>PLATE NO</th>    
                          <th>DRIVER NAME</th>  
                          <th>ASIGNMENT</th>    
                          <th>TRUCK TYPE</th>    
                          <th>STATUS</th>    
                          <th>ODOMETER</th>    
                          <th width="15%">ACTION</th>
                     </tr>       
        </tfoot>   
                    
                    
                    @foreach($trucks as $truck)
                    <tr>
                      <td>{{$truck->operator}}</td>   
                      
                      <td>{{$truck->plate_no}}</td>   

                        <td>
                      @foreach($truck->drivers as $driver)
                        {{$driver->name}}
                      @endforeach
                      </td> 

                      <td>
                      @foreach($truck->assignments as $assignment)
                        {{$assignment->name}}
                      @endforeach
                      </td>  

                      <td>
                      {{$truck->vehicle_type}}
                      </td>   

                      <td>  
                               @foreach($truck->logs as $log)
              {{$log->name}}
          @endforeach
                    </td>

                      <td>
                      {{$truck->odometer}}
                      </td>  
                  

                      <td>
                          <div class="btn-group">
                          <a href="#" class="btn btn-warning">Option</a>
                          <a href="#" class="btn btn-warning dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="caret"></span></a>
                          <ul class="dropdown-menu">
                            <li><a  class="bootstrap-modal-form-open" data-toggle="modal" data-target=".bs-edit{{$truck->id}}-modal-lg" href="">Change Status</a></li>
                            <li><a  href="{{url('trucks/'.$truck->id)}}">History Log</a></li>
                            <li><a href="{{url('trucks/'.$truck->id.'/edit')}}">Edit Truck</a></li>
                            <li class="divider"></li>
                            <li><a href="#">Delete Truck</a></li>
                          </ul>
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



 <!-- show trucks and customer data -->
 @foreach($trucks as $truck)
<!-- modal edit form -->
<div class="modal fade bs-edit{{$truck->id}}-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <span class="modal-title">TRUCKS STATUS</span>
      </div>
      <div class="modal-body">
              <div class="row">
        <div class="col-md-12">
                <div class="panel-body"> 

            {!! Form::model($log = new \App\Log,  ['class' => 'form-horizontal',  'url' => 'logs/'.$truck->id, 'enctype'=>'multipart/form-data'])!!}
            {!! csrf_field() !!}
                    



            @include('logs.form')


     
                    
                </div>
        </div>
    </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary">Submit</button>
          
               
      </div>
      {!! Form::close() !!}
    </div><!-- /.modal-content -->  
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
       @endforeach
<!-- end show data for trucks and customer -->






@endsection