@extends('layouts.app')

@section('content')

    <div class="row">
        <div class="col-md-10 col-md-offset-1">
            <div class="panel panel-default">
                <div class="panel-heading">Manage Tracking</div>
                <div class="panel-body">  
                    
       {!! Form::model($track, ['method' => 'PATCH', 'action' => ['TracksController@update', $track->id], 'class' => 'form-horizontal',  'files' => true, 'name' => 'autoSumForm' ]) !!} 
    {!! csrf_field() !!}
                    
                    
    @include('tracks.form', ['submitButtonText' => 'Submit'])



{!! Form::close() !!}
                    
                </div>
            </div>
        </div>
    </div>

@endsection