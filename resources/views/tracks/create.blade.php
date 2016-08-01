@extends('layouts.app')

@section('content')

    <div class="row">
        <div class="col-md-10 col-md-offset-1">
            <div class="panel panel-default">
                <div class="panel-heading">Add Watchlist</div>
                <div class="panel-body">  
                    
    {!! Form::model($track = new \App\track,  ['class' => 'form-horizontal',  'url' => 'tracks',  'files' => 'true', 'enctype'=>'multipart/form-data', 'novalidate' => 'novalidate', 'id' => 'assetinventoryForm'])!!}
    {!! csrf_field() !!}
                    
                    
                    
        
                    
                    
                    
                    
    @include('tracks.form', ['submitButtonText' => 'Submit'])



{!! Form::close() !!}
                    
                </div>
            </div>
        </div>
    </div>

@endsection