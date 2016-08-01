 <table  id="track-customer"  class=" dt-responsive nowrap display table-responsive table-hover table" width="100%">
                <thead>
                   <tr>
                   <th></th>
                    <th>TRUCK #</th>    
                    <th>Destination</th>    
                    <th>IN CUSTOMER</th>    
                    <th>OUT CUSTOMER</th>    
                    <th>TIME IDLE</th>    
                    <th>ETA</th>    
                      
                </tr>       
                </thead> 
            <tfoot>
            <tr>
                   <th></th>
                    <th>TRUCK #</th>    
                    <th>Destination</th>    
                    <th>IN CUSTOMER</th>    
                    <th>OUT CUSTOMER</th>  
                    <th>TIME IDLE</th>    
                    <th>ETA</th>    
                 
            </tr>
        </tfoot>   
                    
                    
                    @foreach($in_customer as $in_customers)
                    @foreach($in_customers->tracks as $track)
          <tr class="{{ $track->in_customer == '-0001-11-30 00:00:00' || $track->out_customer == '-0001-11-30 00:00:00' ? '' : 'danger' }}">

                            <td>
                          @foreach($track->trucks as $truck)
                        <img class="img-responsive img-circle" style="width: 30px; height:auto;" src="{{asset('/img/trucks/'.$truck->truck_avatar)}}">
                        @endforeach
                         </td>

                        
                        <td>
                            <a class="bootstrap-modal-form-open" data-toggle="modal" data-target=".bs-edit{{$track->id}}-modal-lg" href="">
                            @foreach($track->trucks as $truck)
                         {{ $truck->plate_no }}
                         @endforeach
                         </a>
                            </td>


                         <td>
                         @foreach($track->customers as $customer)
                            {{ str_limit($customer->customer_name,20) }}
                         @endforeach
                            </td>



                         <td>
                              {{  ($track->in_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->in_customer->format('Y-m-d h:i:s A')   ) }}
                            </td>

                         <td>
                            {{  ($track->out_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->out_customer->format('Y-m-d h:i:s A')   ) }}
                            </td>


                            <td>
                                  {{  ($track->in_customer == '-0001-11-30 00:00:00' || $track->out_customer == '-0001-11-30 00:00:00'  ? ($track->in_customer->diffInHours($base_time) >= 407835 ? 'CANNOT DETERMINE' : $track->in_customer->diffInHours($base_time) )  : $track->in_customer->diffInHours($track->out_customer)) }}
                            </td>


                            <td>
                            @foreach($track->customers as $customer)
                              <?php
                                $total = $customer->time_to_customer + $customer->time_to_origin;
                              ?>
                              {{$total}} Hour(s)
                            @endforeach

                            </td>
                        
                    </tr>
                    @endforeach
                    @endforeach
                    
                </table>