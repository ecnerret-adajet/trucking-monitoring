@extends('layouts.app')
 
@section('content')

	 <!-- Content Header (Page header) -->
        <section class="content-header">

          <h1>
            Role Management
            <small>All roles</small>
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
              <h3 class="box-title">ALL ROLES</h3>
@permission('role-create')
<a href="{{url('roles/create')}}" class="btn pull-right btn-primary btn-sm"><i class="fa fa-plus-circle" aria-hidden="true"></i> Create New Role</a>
  @endpermission

            </div><!-- /.box-header -->

                <div class="box-body">

    



    <table class="table table-bordered">
		<tr>
			<th>No</th>
			<th>Name</th>
			<th>Description</th>
			<th width="280px">Action</th>
		</tr>
	@foreach ($roles as $key => $role)
	<tr>
		<td>{{ ++$i }}</td>
		<td>{{ $role->display_name }}</td>
		<td>{{ $role->description }}</td>
		<td>
			<a class="btn btn-info" href="{{ route('roles.show',$role->id) }}">Show</a>
			@permission('role-edit')
			<a class="btn btn-primary" href="{{ route('roles.edit',$role->id) }}">Edit</a>
			@endpermission
			@permission('role-delete')
			{!! Form::open(['method' => 'DELETE','route' => ['roles.destroy', $role->id],'style'=>'display:inline']) !!}
            {!! Form::submit('Delete', ['class' => 'btn btn-danger']) !!}
        	{!! Form::close() !!}
        	@endpermission
		</td>
	</tr>
	@endforeach
	</table>
	{!! $roles->render() !!}




                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>



	
@endsection