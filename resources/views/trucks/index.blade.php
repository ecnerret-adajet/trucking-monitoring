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
                          <th>PLATE NO</th>
                          <th>OPERATOR</th>    
                          <th>DRIVER NAME</th>  
                          <th>ASIGNMENT</th>    
                          <th>TRUCK TYPE</th>    
                          <th>STATUS</th>    
                          <th>ODOMETER</th>    
                          <th width="15%">ACTION</th>
                          <th>DISPATCH</th>
                     </tr>       
                </thead> 
            <tfoot>
                         <tr>
                          <th>PLATE NO</th>    
                           <th>OPERATOR</th>    
                          <th>DRIVER NAME</th>  
                          <th>ASIGNMENT</th>    
                          <th>TRUCK TYPE</th>    
                          <th>STATUS</th>    
                          <th>ODOMETER</th>    
                          <th width="15%">ACTION</th>
                           <th>DISPATCH</th>
                     </tr>       
        </tfoot>   
                    
                    
                    @foreach($trucks as $truck)
                    <tr>

                      <td>
                      <a class="bootstrap-modal-form-open" 
                        data-toggle="modal" 
                        data-target=".bs-show{{$truck->id}}-modal-lg" 
                        style="color: #3498db" 
                        href="">
                        {{$truck->plate_no}}
                      </a>
                      </td>   


                      <td>{{$truck->operator}}</td>   
                      

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
                            <li><a class="bootstrap-modal-form-open" data-toggle="modal" data-target=".bs-edit{{$truck->id}}-modal-lg" href="">Change Status</a></li>
                            <li><a  href="{{url('trucks/'.$truck->id)}}">History Log</a></li>
                            <li><a href="{{url('trucks/'.$truck->id.'/edit')}}">Edit Truck</a></li>
                            <li class="divider"></li>
                            @role(['Administrator'])
                            <li><a href="" data-toggle="modal" data-target=".bs-delete{{$truck->id}}-modal-lg">Delete Truck</a></li>
                            @endrole
                          </ul>
                        </div>
                      </td>

                      <td>
                          
                      @if(count($truck->tracks))
                     
                        @foreach($truck->tracks as $track)
                          <a class="btn btn-success btn-block" href="" data-toggle="modal" data-target=".bs-finish{{$truck->id}}-modal-lg">
                            On dispatch
                          </a>

                        @endforeach
                

                      @else
                      <a class="btn btn-default btn-block" href="">
                        Not dispatch
                      </a>
                      @endif


                      
                        

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

            {!! Form::model($log = new \App\Log,  ['class' => 'form-horizontal bootstrap-modal-form',  'url' => 'logs/'.$truck->id,  'files' => 'true', 'enctype'=>'multipart/form-data'])!!}
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
  
<!-- end show data for trucks and customer -->



<!-- modal show truck information  -->
<div class="modal fade bs-show{{$truck->id}}-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <span class="modal-title">TRUCKS INFORMATION</span>
      </div>
      <div class="modal-body">
              <div class="row">
        <div class="col-md-12">
                <div class="panel-body"> 
                <table class="table  table-hover table-responsive" width="100%">
                  <tbody>
                      <tr>
                          <th>Operator</th>
                          <td>{{$truck->operator}}</td>
                      </tr>
                        <tr>
                          <th>Origin</th>
                          <td>{{$truck->origin}}</td>
                      </tr>
                       <tr>
                          <th>Plate Number</th>
                          <td>{{$truck->plate_no}}</td>
                      </tr>                          
                      <tr>
                          <th>Vehicle Type</th>
                          <td>{{$truck->vehicle_type}}</td>
                      </tr>                       
                      <tr>
                          <th>Capacity</th>
                          <td>{{$truck->capacity}}</td>
                      </tr>                      
                       <tr>
                          <th>Odometer</th>
                          <td>{{$truck->odometer}}</td>
                      </tr>                                      
                    </tbody>
                </table>
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


<!-- delete modal truck information  -->
<div class="modal fade bs-delete{{$truck->id}}-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <span class="modal-title">Delete a truck</span>
      </div>
      <div class="modal-body">
              <div class="row">
        <div class="col-md-12">
                <div class="panel-body"> 

                   <h4>  
            Are you sure you want to delete a Truck ?
        </h4>
        <em>
        <small>This will affect other data that belongs to truck</small>
        </em>

                    
                </div>
        </div>
    </div>
      </div>
      <div class="modal-footer">
    {{ Form::open(['method' => 'DELETE', 'route' => ['trucks.destroy', $truck->id]]) }}
    {!! csrf_field() !!}
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit</button>
        {!! Form::close() !!}
      </div>
    </div><!-- /.modal-content -->  
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->




<!-- manual finish cycle hauler -->
<div class="modal fade bs-finish{{$truck->id}}-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <span class="modal-title">Manual Release</span>
      </div>
      <div class="modal-body">
              <div class="row">
        <div class="col-md-12">
                <div class="panel-body"> 

                   <h4>  
            Are you sure you want to release this Truck ?
        </h4>
        <em>
        <small>This will record a back to plant time base from this action</small>
        </em>

                    
                </div>
        </div>
    </div>
      </div>
      <div class="modal-footer">
   

           <form method="POST" action="{{url('release/'.$track->id.'/'.$truck->id)}}">
        {!! csrf_field() !!}
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit</button>
       </form>
      </div>
    </div><!-- /.modal-content -->  
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->









@endforeach
<!-- end show data for trucks and customer -->
@endsection