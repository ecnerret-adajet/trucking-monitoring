

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


                        <div class="form-group{{ $errors->has('operator') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('operator', 'Operator:')  !!}
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
                        {!! Form::text('plate_no', null,  ['class' => 'form-control', "data-inputmask" => "'mask': '[AAA 999]'", 'data-mask' ]) !!}     

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

                        {!! Form::submit($submitButtonText, ['class' => 'btn btn-sm btn-primary'])  !!}

                         <a class="btn btn-default" href="{{url('trucks')}}">
                         Cancel
                         </a>
                       </div>