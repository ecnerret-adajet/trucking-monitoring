@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Trucks Management
            <small>Edit truck</small>
          </h1>
   
        </section>






      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Edit Truck</h3>
            </div><!-- /.box-header -->

                <div class="box-body">



                   {!! Form::model($truck, ['method' => 'PATCH', 'action' => ['TrucksController@update', $truck->id], 'class' => 'form-horizontal',  'files' => true, 'name' => 'autoSumForm' ]) !!} 
    {!! csrf_field() !!}
                    
                    
                    
    @include('trucks.form', ['submitButtonText' => 'Submit'])



{!! Form::close() !!}

                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection