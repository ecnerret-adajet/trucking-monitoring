@extends('layouts.app')

@section('content')

  
      <!-- Content Header (Page header) -->
        <section class="content-header">
          <h1>
           Reports 
            <small>Control panel</small>
          </h1>
       
        </section>

        <!-- Main content -->
        <section class="content">

          <div class="row">
        
            <div class="col-md-12">

           <!-- Default box -->
          <div class="box">

            <div class="box-header with-border">
            <div class="row">
            <div class="col-md-2">
              <h3 class="box-title">
                       





                  </h3>
            </div>

          
          {{ Form::open(array('url' => '/report', 'method' => 'get')) }}
               <div class="form-group col-md-4">
                 <div class="form-group">

                         <div class="input-group">
    <span class="input-group-addon" style="background-color: #bdc3c7; color: #fff;">Start Date</span>
   <div class='input-group date' id='datetimepicker2'>
                    {!! Form::input('date', 'start_date', null, ['class' => 'form-control']) !!}  
                    <span class="input-group-addon">
                        <span class="glyphicon glyphicon-calendar"></span>
                    </span>
                </div>
  </div>


                
            </div>

     

            </div>

             <div class="form-group col-md-4">

                  <div class="form-group">

                <div class="input-group">
    <span class="input-group-addon" style="background-color: #bdc3c7; color: #fff;">End Date</span>
     <div class='input-group date' id='datetimepicker2'>
                     {!! Form::input('date', 'end_date', null, ['class' => 'form-control']) !!} 
                    <span class="input-group-addon">
                        <span class="glyphicon glyphicon-calendar"></span>
                    </span>
                </div>
  </div>


             
            </div>

                   
                </div><!-- /.form group -->

                 <label class="col-md-2"> 
                        <button type="submit" class="btn btn-primary btn-block pull-right">
                                    <i class="fa fa-btn fa-cog"></i> generate
                                </button>
                 </label>
          {!! Form::close() !!}
               
             
             </div>


            </div><!-- box-header -->
            <div class="box-body">

            <ul class="nav nav-tabs">
<li class="active"><a href="#report-in-plant" data-toggle="tab" class="text-uppercase"><i class="fa fa-truck" aria-hidden="true"></i> In plant</a></li>
  <li><a href="#report-tansit-customer" data-toggle="tab" class="text-uppercase"><i class="fa fa-truck" aria-hidden="true"></i> Transit to customer</a></li>
  <li><a href="#report-in-customer" data-toggle="tab" class="text-uppercase"><i class="fa fa-truck" aria-hidden="true"></i> In customer</a></li>
  <li><a href="#report-transit-plant" data-toggle="tab" class="text-uppercase"><i class="fa fa-truck" aria-hidden="true"></i> Transit to plant</a></li>
</ul>
<div id="myTabContent" class="tab-content">
  <div class="tab-pane fade active in" id="report-in-plant">
    <p style="padding:5px;">
      
  @include('truck-status.report-in-plant')   
    </p>
  </div>
  <div class="tab-pane fade" id="report-tansit-customer">
    <p style="padding:5px;">
      

      @include('truck-status.report-transit-customer')
    </p>
  </div>
  <div class="tab-pane fade" id="report-in-customer">
    <p style="padding:5px;">
      

          @include('truck-status.report-in-customer')
    </p>
  </div>
  <div class="tab-pane fade" id="report-transit-plant">
    <p style="padding:5px;">
      
    @include('truck-status.report-transit-plant')
      
    </p>
  </div>
</div>
              


         
               








            </div><!-- /.box-body -->
            </div><!-- /.col -->
          </div><!-- /.row -->
        </section><!-- /.content -->
      
    
    
    
 

@endsection

