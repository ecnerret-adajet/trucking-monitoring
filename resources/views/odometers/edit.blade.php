@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Truck Odometer
            <small>Update odometer</small>
          </h1>
   
        </section>






      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Update Odometer</h3>
            </div><!-- /.box-header -->

                <div class="box-body">



      {!! Form::model($odometer, ['method' => 'PATCH', 'action' => ['OdometersController@update', $odometer->id], 'class' => 'form-horizontal']) !!} 
    {!! csrf_field() !!}
                    
                    
                    
    @include('odometers.form', ['submitButtonText' => 'Update'])



{!! Form::close() !!}

                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection