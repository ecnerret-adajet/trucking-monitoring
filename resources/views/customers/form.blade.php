   

                        <div class="form-group{{ $errors->has('origin') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('origin', 'Orign:')  !!}
                        </label>
                           <div class="col-md-4 input-group">
                          <div class="input-group-addon">
                        <i class="fa fa-map-marker"></i>
                      </div>
                        {!! Form::text('origin', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('origin'))
                        <span class="help-block">
                        <strong>{{ $errors->first('origin') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                        <div class="form-group{{ $errors->has('customer_name') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('customer_name', 'Customer Name:')  !!}
                        </label>
                          <div class="col-md-4 input-group">
                          <div class="input-group-addon">
                        <i class="fa fa-user"></i>
                      </div>
                        {!! Form::text('customer_name', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('customer_name'))
                        <span class="help-block">
                        <strong>{{ $errors->first('customer_name') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('destination') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('destination', 'Destination:')  !!}
                        </label>
                           <div class="col-md-4 input-group">
                          <div class="input-group-addon">
                        <i class="fa fa-truck"></i>
                      </div>
                        {!! Form::text('destination', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('destination'))
                        <span class="help-block">
                        <strong>{{ $errors->first('destination') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>

                        <div class="form-group{{ $errors->has('phone') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('phone', 'Phone Number:')  !!}
                        </label>
                        <div class="col-md-4 input-group">
                          <div class="input-group-addon">
                        <i class="fa fa-clock-o"></i>
                      </div>
                       <input type="text" name="phone" class="form-control" data-inputmask="'mask': ['9999-999-9999', '+099 99 99 9999[9]-9999']" data-mask />   



                  

                        @if ($errors->has('phone'))
                        <span class="help-block">
                        <strong>{{ $errors->first('phone') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('total_hours') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('total_hours', 'Total Hours:')  !!}
                        </label>
                           <div class="col-md-4 input-group">
                          <div class="input-group-addon">
                        <i class="fa fa-phone"></i>
                      </div>
                        {!! Form::number('total_hours', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('total_hours'))
                        <span class="help-block">
                        <strong>{{ $errors->first('total_hours') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>







                        <div class="col-md-3 col-md-offset-4">

                        {!! Form::submit($submitButtonText, ['class' => 'btn btn-sm btn-primary'])  !!}

                         {!! Form::reset('Cancel', ['class' => 'btn btn-sm btn-default']) !!}
                       </div>