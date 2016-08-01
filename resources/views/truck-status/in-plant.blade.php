 <table  id="track-plant"  class="dt-responsive nowrap display table-responsive table-hover table" width="100%">
                <thead>
                      <tr>
                          <th></th>
                          <th>TRUCK #</th>    
                          <th>DESTINATION</th>    
                          <th>IN PLANT</th>    
                          <th>OUT PLANT</th>    
                          <th>TIME IDLE</th>    
                          <th>ETA</th>    
                     </tr>       
                </thead> 
            <tfoot>
                 <tr>
                    <th></th>
                    <th>TRUCK #</th>    
                    <th>DESTINATION</th>    
                    <th>IN PLANT</th>    
                    <th>OUT PLANT</th>    
                    <th>TIME IDLE</th>    
                    <th>ETA</th>    
                 
            </tr>
        </tfoot>   
                    
                    
                    @foreach($in_plant as $in_plants)
                    @foreach($in_plants->tracks as $track)
       <tr class="{{ ($track->in_plant == '-0001-11-30 00:00:00' || $track->out_plant == '-0001-11-30 00:00:00' ? ($track->in_plant->diffInHours($base_time) < $total ? '' : 'danger') : 'info') }}">

                    
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
                               {{  ($track->in_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->in_plant->format('Y-m-d h:i:s A')   ) }}

                            </td>
                    
           
                             <td>
                                {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->out_plant->format('Y-m-d h:i:s A')   ) }}
                            </td>


                            <td>

                                {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ?  $track->in_plant->diffInHours($base_time).' Hour(s)' :   $track->in_plant->diffInHours($track->out_plant).' Hour(s)'   ) }}

                            </td>

                            <td>

                            @foreach($track->customers as $customer)
                                <?php
                                  $total = 0;
                                  $total = $customer->time_to_origin + $customer->time_to_customer;
                                ?>
                                {{$total}} Hour(s)
                             @endforeach    

                            </td>
                        
                    </tr>
                    @endforeach
                    @endforeach
                    
                </table>