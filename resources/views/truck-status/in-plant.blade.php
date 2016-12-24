                    <div class="row">
                        <div class="col-md-12">
                            <div id="imaginary_container"> 
                                <div class="input-group stylish-input-group">
                                    <input type="text" class="form-control" placeholder="Search" >
                                    <span class="input-group-addon">
                                        <button type="submit">
                                            <span class="glyphicon glyphicon-search"></span>
                                        </button>  
                                    </span>
                                </div>
                            </div>
                        </div>
                  </div>


                  <ul class="products-list product-list-in-box">
                     @foreach($tracks as $track)
                          <li>
                            <div class="row" style="margin: 9px; border: solid 1px #ecf0f1;;">

                  <!--               <div class="col-md-1 product-img">
                                    <img src="{{asset('img/avatars/placeholder.png')}}" class="img-circle" alt="Product Image" style="display: block; margin: 25px auto;" />
                                </div> -->

                                <div class="col-md-12">

                                    <div class="row" style="background-color: #ECECEC;">
                                    
                                            <div class="col-md-2">
                                                <span class="small" style="color: #95a5a6">PLATE NUMBER</span>
                                               <p style="font-weight: 400;">
                                                 
                                                  <a data-toggle="modal" data-target=".bs-edit{{$track->id}}-modal-lg" href="" style="color: #2980b9;">
                                                    @foreach($track->trucks as $truck)
                                                    {{$truck->plate_no}}
                                                    @endforeach
                                                  </a>
                                                
                                                </p>
                                            </div>

                                            <div class="col-md-4">
                                                <span class="small" style="color: #95a5a6">DESTINATION</span>
                                           <p style="font-weight: 400;">
                                                 
                                                    @foreach($track->customers as $customer)
                                                    {{ str_limit($customer->customer_name,30) }}
                                                    @endforeach
                                                  
                                                </p>
                                            </div>

                                            <div class="col-md-4">
                                                <span class="small" style="color: #95a5a6">VENDOR NAME</span>
                                                <p style="font-weight: 400;">
                                                 
                                                    @foreach($track->trucks as $truck)
                                                   {{$truck->vendor_name}}
                                                    @endforeach
                                              
                                                </p>
                                            </div>


                                            <div class="col-md-2">
                                                <span class="small" style="color: #95a5a6">DATE</span>
                                               <p style="font-weight: 400;">
                                                 
{{  ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $track->dispatch->toFormattedDateString()   ) }} 
                                                 
                                                </p>
                                            </div>                               
                                    </div>

                                    <div class="row" style="background-color: #F2F1EF;">
                                      <div class="col-md-2">
                                                <span class="small" style="color: #95a5a6">PLANT IN</span>
                                               <p style="font-weight: 400;">
                                               
                                                    {{  ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->dispatch->format('h:i:s A')   ) }}

                                                
                                                </p>
                                            </div>  


                                           <div class="col-md-2">
                                                <span class="small" style="color: #95a5a6">PLANT OUT</span>
                                                <p style="font-weight: 400;">
                                               
                                                    {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $track->out_plant->format('h:i:s A')   ) }}
                                                
                                                </p>
                                            </div> 


                                            <div class="col-md-2">
                                                <span class="small" style="color: #95a5a6">CUSTOMER IN</span>
                                                <p style="font-weight: 400;">
                                                 
                                                    {{  ($track->in_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $track->in_customer->format('h:i:s A')   ) }}
                                                 
                                                </p>
                                            </div>

                                            <div class="col-md-2">
                                                <span class="small" style="color: #95a5a6">CUSTOMER OUT</span>
                                               <p style="font-weight: 400;">
                                               
                                                    {{  ($track->out_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $track->out_customer->format('h:i:s A')   ) }}
                                              
                                                </p>
                                            </div>

                                            <div class="col-md-2">
                                                <span class="small" style="color: #95a5a6">BACK PLANT</span>
                                                <p style="font-weight: 400;">
                                                    {{  ($track->back_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $track->back_plant->format('h:i:s A')   ) }}
                                                </p>
                                            </div>

                                            <div class="col-md-2">
                                                <span class="small" style="color: #95a5a6">TIME TRAVEL</span>
                                                <p style="font-weight: 400;">
                                                            {{  ($track->back_plant == '-0001-11-30 00:00:00' || $track->dispatch == '-0001-11-30 00:00:00'  ? ($track->dispatch->diffInHours($base_time) >= 407835 ? 'N/A' : $track->dispatch->diffInHours($base_time) )  : $track->dispatch->diffInHours($track->back_plant)) }}
                                                </p>
                                            </div>                                            

                                    </div>

                                </div>


             

                            </div><!-- end row -->

                     </li><!-- /.item -->

                    @endforeach
                  </ul>
 
@include('tracks.paginate', ['paginator' => $tracks])

