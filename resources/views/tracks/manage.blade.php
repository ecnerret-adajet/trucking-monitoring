@extends('layouts.app')

@section('content')

<div class="container">

<div class="row">
<table style="border-top: 2px solid #bdc3c7;" id="track-plant"  class=" dt-responsive nowrap display table-responsive table  table-hover " width="100%">
                <thead>
                <tr>
                   <th>TRUCK #</th>    
                    <th>Destination</th>    
                    <th>IN PLANT</th>    
                    <th>OUT PLANT</th>    
                    <th>OUT CUSTOMER</th>    
                    <th>IN CUSTOMER</th> 
                    <th>ACTION</th> 

                </tr>       
                </thead> 
            <tfoot>
            <tr>
                    <th>TRUCK #</th>    
                    <th>Destination</th>    
                    <th>IN PLANT</th>    
                    <th>OUT PLANT</th>    
                    <th>OUT CUSTOMER</th>    
                    <th>IN CUSTOMER</th> 
                    <th>ACTION</th> 
                 
        </tfoot>   
            </tr>
                    
                    
                    @foreach($tracks as $track)
       <tr class="{{ $track->out_plant->diffInHours($track->in_plant) >= '1' && $track->out_plant->diffInHours($track->in_plant) <= '2'  ? 'info' : ''  }} {{ $track->out_plant->diffInHours($track->in_plant) == '3' ? 'success' : ''  }} {{ $track->out_plant->diffInHours($track->in_plant) == '4' ? 'warning' : ''  }} {{ $track->out_plant->diffInHours($track->in_plant) >= '5' && $track->out_plant->diffInHours($track->in_plant) <= '1000'  ? 'danger' : ''  }}  ">
                        
                        
                    
                            <td>
                            @foreach($track->trucks as $truck)
                         {{ $truck->plate_no }}
                         @endforeach
                            </td>


                         <td>
                         @foreach($track->customers as $customer)
                            {{ str_limit($customer->customer_name,20) }}
                         @endforeach
                            </td>
                       
                         <td>
                              {{($track->out_plant == '-0001-11-30 00:00:00' ? '0000-00-00 00:00:00' : $track->out_plant)}}
                             
                            </td> 
           
             <td>
                             {{($track->in_plant == '-0001-11-30 00:00:00' ? '0000-00-00 00:00:00' : $track->in_plant)}}
                             
                            </td>

                         

                            <td>
                             {{($track->in_customer == '-0001-11-30 00:00:00' ? '0000-00-00 00:00:00' : $track->in_customer)}}
                            </td>

                            <td>
                             {{($track->out_customer == '-0001-11-30 00:00:00' ? '0000-00-00 00:00:00' : $track->out_customer)}}
                            </td>

                                     
          <td> 

          <a  href="{{url('/tracks/'.$track->id.'/edit' )}}" class="btn btn-primary">Manage</a>
              
          </td>
                        
                    </tr>
                    @endforeach
                    
                </table>

</div><!-- row  -->

</div><!-- container -->






@endsection