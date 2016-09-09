
<div class="form-group{{ $errors->has('truck_list') ? ' has-error' : '' }}">
<label class="col-md-4 control-label"> 
{!! Form::label('truck_list', 'Truck Plate #:')  !!} 
</label>
<div class="col-md-6">
{!! Form::select('truck_list', $trucks, null, ['class' => 'form-control select', 'placeholder' => 'Select truck', 'v-model' => 'searchQuery']) !!}

@if ($errors->has('truck_list'))
<span class="help-block">
<strong>{{ $errors->first('truck_list') }}</strong>
</span>
@endif
</div>
</div>


<div class="form-group hide">
<label class="col-md-4 control-label"> 
{!! Form::label('dispatch', 'Entry Date:')  !!}
</label>
<div class="col-md-6">
{!! Form::input('date', 'dispatch', Carbon\Carbon::now()->format('Y-m-d'), ['class' => 'form-control']) !!}         
</div>
</div>

 
<hr/>


            
<div class="form-group{{ $errors->has('customer_list') ? ' has-error' : '' }}">
<label class="col-md-4 control-label"> 
{!! Form::label('customer_list', 'Customer:')  !!} 
</label>
<div class="col-md-6">
{!! Form::select('customer_list', $customers, null, ['class' => 'form-control select', 'placeholder' => 'select customer']) !!}

@if ($errors->has('customer_list'))
<span class="help-block">
<strong>{{ $errors->first('customer_list') }}</strong>
</span>
@endif
</div>
</div>


      

<div class="col-md-3 col-md-offset-4">
{!! Form::submit($submitButtonText, ['class' => 'btn btn-sm btn-primary'])  !!}
 {!! Form::reset('Cancel', ['class' => 'btn btn-sm btn-default']) !!}
</div>



                   



  

                       





