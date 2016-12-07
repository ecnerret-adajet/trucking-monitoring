 <table  id="track-plant"  class="dt-responsive nowrap display table-responsive table-hover table" width="100%">
                <thead>
                      <tr>
                          <th>TRUCK #</th>    
                          <th>DESTINATION</th>    
                          <th>ATL Dispatch</th>    
                          <th>IN PLANT</th>    
                          <th>OUT PLANT</th>    
                          <th>TIME IDLE</th>    
                          <th>ETA</th>    
                     </tr>       
                </thead> 
            <tfoot>
                 <tr>
                    <th>TRUCK #</th>    
                    <th>DESTINATION</th>    
                    <th>ATL Dispatch</th>    
                    <th>IN PLANT</th>    
                    <th>OUT PLANT</th>    
                    <th>TIME IDLE</th>    
                    <th>ETA</th>    
                 
            </tr>
        </tfoot>   
                    
                    
                    @foreach($tracks as $track)
       <tr class="{{ ($track->in_plant == '-0001-11-30 00:00:00' || $track->out_plant == '-0001-11-30 00:00:00' ? ( $track->in_plant->diffInHours($base_time) > $total ? 'danger' : '') : 'info') }}">

                    
                  
                        
                        
                    
                            <td>
                            {{$track->id}} -
                            <a style="color: #3498db;" class="bootstrap-modal-form-open" data-toggle="modal" data-target=".bs-edit{{$track->id}}-modal-lg" href="">
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
                               {{  ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->dispatch->format('Y-m-d h:i:s A')   ) }}

                            </td>
                       
                          

                            <td>
                               {{  ($track->entry_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->entry_plant->format('Y-m-d h:i:s A')   ) }}

                            </td>
                    
           
                             <td>
                                {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->out_plant->format('Y-m-d h:i:s A')   ) }}
                            </td>


                            <td>

  
                                   {{  ($track->out_plant == '-0001-11-30 00:00:00' || $track->entry_plant == '-0001-11-30 00:00:00'  ? ($track->entry_plant->diffInHours($base_time) >= 407835 ? 'CANNOT DETERMINE' : $track->entry_plant->diffInHours($base_time) )  : $track->entry_plant->diffInHours($track->out_plant)) }}

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