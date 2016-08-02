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