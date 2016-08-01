@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Customer Management
            <small>Edit Customer</small>
          </h1>
   
        </section>






      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Edit Customer</h3>
            </div><!-- /.box-header -->

                <div class="box-body">


                   {!! Form::model($customer, ['method' => 'PATCH', 'action' => ['CustomersController@update', $customer->id], 'class' => 'form-horizontal',  'files' => true, 'name' => 'autoSumForm' ]) !!} 
    {!! csrf_field() !!}
                    
                    
                    
    @include('customers.form', ['submitButtonText' => 'Submit'])



{!! Form::close() !!}

                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection