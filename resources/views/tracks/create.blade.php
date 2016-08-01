@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
             Deploying Truck
            <small>Truck Management</small>
          </h1>
   
        </section>










      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Deploy Truck</h3>
            </div><!-- /.box-header -->

                <div class="box-body">


    
       
  <div id="truck-main">

                <trucks></trucks>

       <template id="trucks-template">

<table  class="table  table-hover table-padding ">
  <thead>
    <tr class="customer-th">
      <th>Customer name</th>
      <th>Origin</th>
      <th>Destination</th>
      <th>Phone</th>
    </tr>
  </thead>
  <tbody>
   
    <tr v-for="truck in list" class="customer-tr">
     
 
      <td> @{{truck.location}}</td>
      <td> @{{truck.plate_no}}</td>
      <td> @{{truck.driver}}</td>
      <td> @{{truck.phone}}</td>


    </tr>
    
  </tbody>
</table> 

        </template>

                 
                </div><!-- /.box-body -->

                  
    {!! Form::model($track = new \App\track,  ['class' => 'form-horizontal',  'url' => 'tracks',  'files' => 'true', 'enctype'=>'multipart/form-data', 'novalidate' => 'novalidate', 'id' => 'main'])!!}
    {!! csrf_field() !!}
                    
                    
                    
        
                    
                    
                    
                    
    @include('tracks.form', ['submitButtonText' => 'Submit'])



{!! Form::close() !!}
                    
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection