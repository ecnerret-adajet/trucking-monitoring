@extends('layouts.app')
 
@section('content')

              <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            User Management
            <small>Edit user</small>
          </h1>
   
        </section>
    



     <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">Edit user</h3>
            </div><!-- /.box-header -->

                <div class="box-body">


                   <center>
                        <img class="img-responsive img-circle" style="width: 150px; height:150px; margin-bottom: 20px;"  src="{{asset('/img/avatars/'.$user->avatar)}}">
                      </center>


    {!! Form::model($user, ['method' => 'PATCH','route' => ['users.update', $user->id], 'class' => 'form-horizontal' , 'enctype'=>'multipart/form-data']) !!}
     {!! csrf_field() !!}

                          <div class="form-group">
                            <div class="col-md-offset-3 col-md-5">                                
                            <input type="file" name="avatar">
                            </div>
                        </div>
    

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

                  <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('email', 'Email:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('email', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('email'))
                        <span class="help-block">
                        <strong>{{ $errors->first('email') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

             <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('password', 'Password:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::password('password', ['class' => 'form-control']) !!}     

                        @if ($errors->has('password'))
                        <span class="help-block">
                        <strong>{{ $errors->first('password') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                    <div class="form-group{{ $errors->has('confirm-password') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('confirm-password', 'Confirm password:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::password('confirm-password', ['class' => 'form-control']) !!}     

                        @if ($errors->has('confirm-password'))
                        <span class="help-block">
                        <strong>{{ $errors->first('confirm-password') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                          <div class="form-group">
                        <label class="col-md-4 control-label"> 
                       Role:
                        </label>
                           <div class="col-md-4">
                       {!! Form::select('roles[]', $roles,$userRole, array('class' => 'form-control','placeholder' => '--- Select Role ---')) !!}    
                     
                        </div>
                        </div>


                            <div class="col-md-3 col-md-offset-4">
{!! Form::submit('Submit', ['class' => 'btn btn-sm btn-primary'])  !!}
 <a href="{{url('/users')}}" class="btn btn-sm btn-default" style="color: #000"> Cancel</a>

</div>


    {!! Form::close() !!}

                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>





	
@endsection