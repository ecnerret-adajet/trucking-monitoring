@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Odometer
            <small>Update Odometer</small>
          </h1>
   
        </section>






      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Update Odometer</h3>
            </div><!-- /.box-header -->

                <div class="box-body">


        {!! Form::model($odometer = new \App\Odometer,  ['class' => 'form-horizontal',  'url' => 'odometers/'.$id ])!!}
              {!! csrf_field() !!}
                                        
        @include('odometers.form', ['submitButtonText' => 'Submit'])

        {!! Form::close() !!}

                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection