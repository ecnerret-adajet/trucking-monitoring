@extends('layouts.app')

@section('content')

        <!-- Content Header (Page header) -->
        <section class="content-header">


          <h1>
            Customer Management
            <small>All Customer</small>
          </h1>
   
        </section>






      <section class="content">

          <div class="box">
                 <div class="box-header with-border">
              <h3 class="box-title">ALL CUSTOMER</h3>
            </div><!-- /.box-header -->

                <div class="box-body" id="customer-main">

             <table  id="list-truck" class="table table-bordered  table-hover table-padding">
                <thead>
                      <tr>
                          <th>ORIGIN</th>    
                          <th>CUSTOMER NAME</th>    
                          <th>CITY</th>    
                          <th>CONTACT</th>    
                          <th>ETA</th>    
                          <th>EDIT</th> 
                        

                     </tr>       
                </thead> 
            <tfoot>
                 <tr>
                      <th>ORIGIN</th>    
                          <th>CUSTOMER NAME</th>    
                          <th>CITY</th>    
                          <th>CONTACT</th>    
                          <th>ETA</th>    
                          <th>EDIT</th> 
                        
               </tr>
        </tfoot>   
                    
                    
                    @foreach($customers as $customer)
                    <tr>
                      <td>{{$customer->origin}}</td>   
                      <td>{{$customer->customer_name}}</td>   
                      <td>{{$customer->destination}}</td>   
                      <td>{{$customer->phones}}</td>   
                      <td>{{$customer->total_hours}}</td>   
                        <td>
                        <a href="{{url('customers/'.$customer->id.'/edit')}}"> <i class="fa fa-cog action" aria-hidden="true"></i></a>
                        </td>
                        
                    </tr>
                    @endforeach
                    
                </table>
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection