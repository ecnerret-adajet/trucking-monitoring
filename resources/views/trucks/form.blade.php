                         <div class="form-group">
                            <div class="col-md-offset-3 col-md-5">                                
                            <input name="truck_avatar" type="file" class="filestyle" data-size="sm" data-buttonName="btn-primary" data-buttonBefore="true">
                            </div>
                        </div>


                        <div class="form-group{{ $errors->has('location') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('location', 'Location:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('location', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('location'))
                        <span class="help-block">
                        <strong>{{ $errors->first('location') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('driver') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('driver', 'Driver:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('driver', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('driver'))
                        <span class="help-block">
                        <strong>{{ $errors->first('driver') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                        <div class="form-group{{ $errors->has('plate_no') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('plate_no', 'Plate Number:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('plate_no', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('plate_no'))
                        <span class="help-block">
                        <strong>{{ $errors->first('plate_no') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                        <div class="form-group{{ $errors->has('phone') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('phone', 'Phone Number:')  !!}
                        </label>
                        <div class="col-md-4 ">
                      
                       <input type="text" name="phone" class="form-control" data-inputmask="'mask': ['9999-999-9999', '+099 99 99 9999[9]-9999']" data-mask />   

                        @if ($errors->has('phone'))
                        <span class="help-block">
                        <strong>{{ $errors->first('phone') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('truck_type') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('truck_type', 'Truck Type:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('truck_type', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('truck_type'))
                        <span class="help-block">
                        <strong>{{ $errors->first('truck_type') }}</strong>
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


                        <div class="form-group{{ $errors->has('vendor_name') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('vendor_name', 'Vendor Name:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('vendor_name', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('vendor_name'))
                        <span class="help-block">
                        <strong>{{ $errors->first('vendor_name') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('subcon_vendor') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('subcon_vendor', 'Subcon Vendor:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('subcon_vendor', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('subcon_vendor'))
                        <span class="help-block">
                        <strong>{{ $errors->first('subcon_vendor') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                        <div class="form-group{{ $errors->has('type_goods') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('type_goods', 'Type of goods:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('type_goods', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('type_goods'))
                        <span class="help-block">
                        <strong>{{ $errors->first('type_goods') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                        <div class="form-group{{ $errors->has('vehicle_type') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('vehicle_type', 'Vichele type:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('vehicle_type', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('vehicle_type'))
                        <span class="help-block">
                        <strong>{{ $errors->first('vehicle_type') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                          <div class="col-md-3 col-md-offset-4">

                        {!! Form::submit($submitButtonText, ['class' => 'btn btn-sm btn-primary'])  !!}

                         {!! Form::reset('Cancel', ['class' => 'btn btn-sm btn-default']) !!}
                       </div>