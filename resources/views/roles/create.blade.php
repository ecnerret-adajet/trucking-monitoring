@extends('layouts.app')
 
@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Role Management
            <small>Add role</small>
          </h1>
   
        </section>
    <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Add Roles</h3>

            </div><!-- /.box-header -->

                <div class="box-body">

                {!! Form::open(array('route' => 'roles.store','method'=>'POST','class' => 'form-horizontal')) !!}


                 <div class="form-group{{ $errors->has('name') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('name', 'Name:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('name', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('name'))
                        <span class="help-block">
                        <strong>{{ $errors->first('name') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                  <div class="form-group{{ $errors->has('display_name') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('display_name', 'Display name:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('display_name', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('display_name'))
                        <span class="help-block">
                        <strong>{{ $errors->first('display_name') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                     <div class="form-group{{ $errors->has('description') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('description', 'Description:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::textarea('description', null,  ['class' => 'form-control','style'=>'height:100px']) !!}     

                        @if ($errors->has('description'))
                        <span class="help-block">
                        <strong>{{ $errors->first('description') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                          <div class="form-group">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('permission', 'Permissions:')  !!}
                        </label>
                           <div class="col-md-4">
                         @foreach($permission as $value)
                    <label>{{ Form::checkbox('permission[]', $value->id, false, array('class' => 'name')) }}
                    {{ $value->display_name }}</label>
                    <br/>
                @endforeach    
                     
                        </div>
                        </div>

    <div class="col-md-3 col-md-offset-4">
    <a href="{{url('/roles')}}" class="btn btn-sm btn-default" style="color: #000"> Cancel</a>
{!! Form::submit('Submit', ['class' => 'btn btn-sm btn-primary'])  !!}
 

</div>
    {!! Form::close() !!}
                    
                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>







@endsection