
                        <div class="form-group{{ $errors->has('name') ? ' has-error' : '' }}">
                        <label class="col-md-3 control-label"> 
                        {!! Form::label('name', 'Driver:')  !!}
                        </label>
                           <div class="col-md-9">
                        {!! Form::select('name', $stats, null,  ['class' => 'form-control', 'placeholder' => 'Assign Driver']) !!}     
                        @if ($errors->has('name'))
                        <span class="help-block">
                        <strong>{{ $errors->first('name') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                       <div class="form-group{{ $errors->has('location') ? ' has-error' : '' }}">
                        <label class="col-md-3 control-label"> 
                        {!! Form::label('location', 'Location:')  !!}
                        </label>
                           <div class="col-md-9">
                      
                        {!! Form::text('location', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('location'))
                        <span class="help-block">
                        <strong>{{ $errors->first('location') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                       <div class="form-group{{ $errors->has('dr_date') ? ' has-error' : '' }}">
                        <label class="col-md-3 control-label"> 
                        {!! Form::label('dr_date', 'DR Date:')  !!}
                        </label>
                           <div class="col-md-9">
                      
                        {!! Form::input('date', 'dr_date', $log->dr_date->format('Y-m-d'),  ['class' => 'form-control']) !!}     

                        @if ($errors->has('dr_date'))
                        <span class="help-block">
                        <strong>{{ $errors->first('dr_date') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>


                       <div class="form-group{{ $errors->has('customer') ? ' has-error' : '' }}">
                        <label class="col-md-3 control-label"> 
                        {!! Form::label('customer', 'Customer:')  !!}
                        </label>
                           <div class="col-md-9">
                      
                        {!! Form::text('customer', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('customer'))
                        <span class="help-block">
                        <strong>{{ $errors->first('customer') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                       <div class="form-group{{ $errors->has('customer_address') ? ' has-error' : '' }}">
                        <label class="col-md-3 control-label"> 
                        {!! Form::label('customer_address', 'Customer Address:')  !!}
                        </label>
                           <div class="col-md-9">
                      
                        {!! Form::text('customer_address', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('customer_address'))
                        <span class="help-block">
                        <strong>{{ $errors->first('customer_address') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>



                       <div class="form-group{{ $errors->has('commodities') ? ' has-error' : '' }}">
                        <label class="col-md-3 control-label"> 
                        {!! Form::label('commodities', 'Commodities:')  !!}
                        </label>
                           <div class="col-md-9">
                      
                        {!! Form::text('commodities', null,  ['class' => 'form-control']) !!}     

                        @if ($errors->has('commodities'))
                        <span class="help-block">
                        <strong>{{ $errors->first('commodities') }}</strong>
                        </span>
                        @endif
                        </div>
                        </div>







