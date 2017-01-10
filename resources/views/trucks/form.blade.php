

                        <div class="form-group{{ $errors->has('driver_list') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('driver_list', 'Driver:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::select('driver_list', $drivers, null,  ['class' => 'form-control select', 'placeholder' => 'Assign Driver']) !!}     
                        @if ($errors->has('driver_list'))
                        <span class="help-block">
                        <strong>{{ $errors->first('driver_list') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                        <div class="form-group{{ $errors->has('assignment_list') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('assignment_list', 'Assignment:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::select('assignment_list', $assignments, null,  ['class' => 'form-control select', 'placeholder' => 'Assignment']) !!}     
                        @if ($errors->has('assignment_list'))
                        <span class="help-block">
                        <strong>{{ $errors->first('assignment_list') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                        <div class="form-group{{ $errors->has('vendor_name') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('vendor_name', 'Vendor Name:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('vendor_name', null,  ['class' => 'form-control', 'value' => "{{ old('vendor_name') }}"]) !!}     

                        @if ($errors->has('vendor_name'))
                        <span class="help-block">
                        <strong>{{ $errors->first('vendor_name') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                        <div class="form-group{{ $errors->has('operator') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('operator', 'Operator/Subcon Vendor:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('operator', null,  ['class' => 'form-control', 'value' => "{{ old('operator') }}"]) !!}     

                        @if ($errors->has('operator'))
                        <span class="help-block">
                        <strong>{{ $errors->first('operator') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                        <div class="form-group{{ $errors->has('plate_no') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('plate_no', 'Plate Number:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('plate_no', null,  ['class' => 'form-control' ]) !!}     

                        @if ($errors->has('plate_no'))
                        <span class="help-block">
                        <strong>{{ $errors->first('plate_no') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('vehicle_type') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('vehicle_type', 'Vehicle Type:')  !!}
                        </label>
                        <div class="col-md-4 ">
                        {!! Form::text('vehicle_type', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('vehicle_type'))
                        <span class="help-block">
                        <strong>{{ $errors->first('vehicle_type') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('types_goods') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('types_goods', 'Types of goods:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('types_goods', null,  ['class' => 'form-control', 'value' => "{{ old('types_goods') }}"]) !!}     

                        @if ($errors->has('types_goods'))
                        <span class="help-block">
                        <strong>{{ $errors->first('types_goods') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('capacity') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('capacity', 'Capacity:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('capacity', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('capacity'))
                        <span class="help-block">
                        <strong>{{ $errors->first('capacity') }}</strong>
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
