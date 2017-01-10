                        <div class="form-group{{ $errors->has('odometer_count') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('odometer_count', 'Odometer count:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('odometer_count', null,  ['class' => 'form-control', 'value' => "{{ old('odometer_count') }}"]) !!}     

                        @if ($errors->has('odometer_count'))
                        <span class="help-block">
                        <strong>{{ $errors->first('odometer_count') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('distance_travel') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('distance_travel', 'Distance Travel:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('distance_travel', null,  ['class' => 'form-control', 'value' => "{{ old('distance_travel') }}"]) !!}     

                        @if ($errors->has('distance_travel'))
                        <span class="help-block">
                        <strong>{{ $errors->first('distance_travel') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                        <div class="form-group{{ $errors->has('fuel_loaded') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('fuel_loaded', 'Fuel Loaded:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('fuel_loaded', null,  ['class' => 'form-control', 'value' => "{{ old('fuel_loaded') }}"]) !!}     

                        @if ($errors->has('fuel_loaded'))
                        <span class="help-block">
                        <strong>{{ $errors->first('fuel_loaded') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                             <div class="col-md-3 col-md-offset-4">

                         <a href="" data-toggle="modal" data-target=".bs-submit-modal-lg" class="btn btn-primary">
                            Submit
                         </a> 
                       

                         <a class="btn btn-default" href="{{url('trucks')}}">
                         Cancel
                         </a>
                       </div>






    <!-- Confirm truck form submittion -->
<div class="modal fade bs-submit-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <span class="modal-title">Confirm Changes</span>
      </div>
      <div class="modal-body">
              <div class="row">
        <div class="col-md-12">
                <div class="panel-body"> 

                   <h4>  
            Are you sure you want to save changes  ?
        </h4>

                    
                </div>
        </div>
    </div>
      </div>
      <div class="modal-footer">
   

        {!! Form::submit($submitButtonText, ['class' => 'btn btn-sm btn-primary'])  !!}
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
       
      </div>
    </div><!-- /.modal-content -->  
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->