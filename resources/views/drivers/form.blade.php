
                        <div class="form-group">
                            <div class="col-md-offset-3 col-md-5">                                
                            <input name="truck_avatar" type="file" class="filestyle" data-size="sm" data-buttonName="btn-primary" data-buttonBefore="true">
                            </div>
                        </div>
                        

                        <div class="form-group{{ $errors->has('name') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('name', 'Driver Name:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('name', null,  ['class' => 'form-control', 'value' => "{{ old('name') }}"]) !!}     

                        @if ($errors->has('name'))
                        <span class="help-block">
                        <strong>{{ $errors->first('name') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('operator') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('operator', 'Operator:')  !!}
                        </label>
                           <div class="col-md-4">
                        {!! Form::text('operator', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('operator'))
                        <span class="help-block">
                        <strong>{{ $errors->first('operator') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('phone') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('phone', 'Phone Number 1:')  !!}
                        </label>
                        <div class="col-md-4 ">
                        {!! Form::text('phone', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('phone'))
                        <span class="help-block">
                        <strong>{{ $errors->first('phone') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                        <div class="form-group{{ $errors->has('phone_backup') ? ' has-error' : '' }}">
                        <label class="col-md-4 control-label"> 
                        {!! Form::label('phone_backup', 'Phone Number 2:')  !!}
                        </label>
                        <div class="col-md-4 ">
                        {!! Form::text('phone_backup', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('phone_backup'))
                        <span class="help-block">
                        <strong>{{ $errors->first('phone_backup') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                          <div class="col-md-3 col-md-offset-4">

                        {!! Form::submit($submitButtonText, ['class' => 'btn btn-sm btn-primary'])  !!}

                         {!! Form::reset('Cancel', ['class' => 'btn btn-sm btn-default']) !!}
                       </div>