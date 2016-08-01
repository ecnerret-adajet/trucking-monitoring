@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Truck Management
            <small>Add truck</small>
          </h1>
   
        </section>






      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Add Trucks</h3>
            </div><!-- /.box-header -->

                <div class="box-body">

                      <center>
                        <img class="img-responsive img-circle" style="width: 150px; height:150px; margin-bottom: 20px;"  src="{{asset('/img/trucks/truck-avatar.png')}}">
                      </center>



                        {!! Form::model($truck = new \App\Truck,  ['class' => 'form-horizontal',  'url' => 'trucks',  'files' => 'true', 'enctype'=>'multipart/form-data', 'novalidate' => 'novalidate', 'id' => 'assetinventoryForm'])!!}
    {!! csrf_field() !!}


                    
                    
                    
    @include('trucks.form', ['submitButtonText' => 'Submit'])



{!! Form::close() !!}

                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection