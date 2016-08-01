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
              <h3 class="box-title">All Customer</h3>
            </div><!-- /.box-header -->

                <div class="box-body" id="customer-main">

                <customers></customers>

       <template id="customers-template">

<table  class="table  table-hover table-padding ">
  <thead>
    <tr class="customer-th">
      <th></th>
      <th>Customer name</th>
      <th>Origin</th>
      
      <th>Destination</th>
      <th>Phone</th>
      <th>Total hours</th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
   
    <tr v-for="customer in list" class="customer-tr">
     
      <td><img class="img-responsive img-circle" style="width: 35px; height:auto;" src="{{asset('/avatars/placeholder.png')}}"></td>
      <td> @{{customer.customer_name}}</td>
      <td> @{{customer.origin}}</td>
     
      <td> @{{customer.destination}}</td>
      <td> @{{customer.phones}}</td>
      <td> @{{customer.total_hours}}</td>
      <td><a href="{{url('customers')}}/@{{customer.id}}/edit"> <i class="fa fa-cog action" aria-hidden="true"></i></a></td>
      <td><a href="#"><i class="fa fa-trash action" aria-hidden="true"></i> </td>

    </tr>
    
  </tbody>
</table> 

        </template>










                 
                </div><!-- /.box-body -->
                   <div class="box-footer">
          
            </div>
              </div><!-- /.box -->





</section>

          




@endsection