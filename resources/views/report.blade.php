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
            <div class="col-md-6">
              <h3 class="box-title">
              
                  </h3>
            </div>

          
          
               <div class="form-group col-md-4">
                      
                    <div class="input-group ">
                      <div class="input-group-addon">
                        <i class="fa fa-calendar"></i>
                      </div>
                      <input type="text" class="form-control pull-right" id="report" />
                    </div><!-- /.input group -->

                   
                </div><!-- /.form group -->

                 <label class="col-md-2"> 
                        <button type="submit" class="btn btn-primary btn-block pull-right">
                                    <i class="fa fa-btn fa-cog"></i> generate
                                </button>
                      </label>

               
             
             </div>


            </div><!-- box-header -->
            <div class="box-body">
              





            </div><!-- /.box-body -->
     



            </div><!-- /.col -->
          </div><!-- /.row -->
        </section><!-- /.content -->
      
    
    
    
 

@endsection

