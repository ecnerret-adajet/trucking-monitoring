@extends('layouts.app')
 
@section('content')


      <!-- Content Header (Page header) -->
        <section class="content-header">

          <h1>
            User Management
            <small>All user</small>
          </h1>
   
       </section>

	@if ($message = Session::get('success'))
		<div class="alert alert-success">
			<p>{{ $message }}</p>
		</div>
	@endif


	     <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">ALL CUSTOMER</h3>

<a href="{{ route('users.create') }}" class="btn pull-right btn-primary btn-sm"><i class="fa fa-plus-circle" aria-hidden="true"></i> Create New User</a>

            </div><!-- /.box-header -->

                <div class="box-body">

        	<table class="table table-bordered">
		<tr>
			<th>No</th>
			<th>Name</th>
			<th>Email</th>
			<th>Roles</th>
			<th width="280px">Action</th>
		</tr>
	@foreach ($data as $key => $user)
	<tr>
		<td>{{ ++$i }}</td>
		<td>{{ $user->name }}</td>
		<td>{{ $user->email }}</td>
		<td>
			@if(!empty($user->roles))
				@foreach($user->roles as $v)
					<label class="label label-success">{{ $v->display_name }}</label>
				@endforeach
			@endif
		</td>
		<td>
			<a class="btn btn-info" href="{{ route('users.show',$user->id) }}">Show</a>
			<a class="btn btn-primary" href="{{ route('users.edit',$user->id) }}">Edit</a>
			{!! Form::open(['method' => 'DELETE','route' => ['users.destroy', $user->id],'style'=>'display:inline']) !!}
            {!! Form::submit('Delete', ['class' => 'btn btn-danger']) !!}
        	{!! Form::close() !!}
		</td>
	</tr>
	@endforeach
	</table>
	{!! $data->render() !!}





                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>



@endsection