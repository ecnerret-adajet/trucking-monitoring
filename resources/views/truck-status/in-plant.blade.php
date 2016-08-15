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
                    
                    
                    @foreach($tracks as $track)
       <tr class="{{ ($track->in_plant == '-0001-11-30 00:00:00' || $track->out_plant == '-0001-11-30 00:00:00' ? ( $track->in_plant->diffInHours($base_time) > $total ? 'danger' : '') : 'info') }}">

                    
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
                               {{  ($track->entry_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->entry_plant->format('Y-m-d h:i:s A')   ) }}

                            </td>
                    
           
                             <td>
                                {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->out_plant->format('Y-m-d h:i:s A')   ) }}
                            </td>


                            <td>

                                {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ?  $track->entry_plant->diffInHours($base_time).' Hour(s)' :   $track->entry_plant->diffInHours($track->out_plant).' Hour(s)'   ) }}

                            </td>

                            <td>
                           
                          @foreach($track->customers as $customer)
                            {{$customer->total_hours}}
                          @endforeach
                           <?php
                              $total = $customer->total_hours;
                            ?>
                            </td>
                        
                    </tr>
                    @endforeach
                    
                </table>