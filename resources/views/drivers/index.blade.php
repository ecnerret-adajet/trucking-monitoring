@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Driver Management
            <small>All Drivers</small>
          </h1>
   
        </section>






      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">All Drivers
              <a class="btn btn-primary" href="{{url('drivers/create')}}">
              Add Driver
              </a>
              </h3>
            </div><!-- /.box-header -->

                <div class="box-body">


<table  id="list-truck" class="table table-bordered  table-hover table-padding">
                <thead>
                      <tr>

                          <th>NAME</th>    
                          <th>OPERATOR</th>    
                          <th>PHONE NUMBER</th>    
                          <th class="text-center">ACTION</th>                      
                     </tr>       
                </thead> 
            <tfoot>
            <tr>
                               <th>NAME</th>    
                          <th>OPERATOR</th>    
                          <th>PHONE NUMBER</th>    
                          <th class="text-center">ACTION</th>                      
                     </tr> 
                </tfoot>   
                    
                    
                    @foreach($drivers as $driver)
                    <tr>
             
                      <td>
                      <div class="row">
                          <div class="col-md-2">
                           <img class="img-circle" style="height: 50px; width: auto;" src="{{asset('img/drivers/'.$driver->avatar)}}">
                          </div>
                          <div class="col-md-10 text-left">
                              {{$driver->name}}
                          </div>
                      </div> 
                    
                      </td>   
                      <td>{{$driver->operator}}</td>   
                      <td>{{$driver->phone}}</td>   
                      <td width="20%">
                                 <div class="btn-group btn-group-justified">
                          <a class="btn btn-info" href="{{url('drivers/'.$driver->id.'/edit')}}"> 
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