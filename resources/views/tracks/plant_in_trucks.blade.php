<table class="table table-bordered table-hover" style=" border: 2px solid #42b983;
  border-radius: 3px;
  background-color: #fff;">
<thead>
<tr class="success">
  <th>ID #</th>
  <th>Plate Number</th>
  <th>Destination</th>
  <th>ALT Dispatch time</th>
  <th>ETA</th>
  <th>Action</th>
</tr>
</thead>
<tbody>



@foreach($tracks as $track)


@if ($track->entry_plant == '-0001-11-30 00:00:00' && $track->out_plant == '-0001-11-30 00:00:00' )


<tr>
<td>{{ $track->id }}</td>
<td>
  @foreach($track->trucks as $truck)
  {{ $truck->plate_no }}
  @endforeach
</td>
<td>
  @foreach($track->customers as $customer)
  {{ $customer->customer_name }}
  @endforeach
</td>
<td>
    {{  ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '0000-00-00 00:00:00 ' : $track->dispatch->format('Y-m-d h:i:s A')   ) }}

</td>
<td>
      @foreach($track->customers as $customer)
                            {{$customer->total_hours}}
                          @endforeach
</td>
<td>
     
                    
                    
                    
<button type="button" class="btn btn-primary btn-sm btn-block" data-toggle="modal" data-target="#myModal-{{$track->id}}">Plant in</button>



</td>
</tr>


<!-- Modal -->
<div class="modal fade" id="myModal-{{$track->id}}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">Confirm Changes</h4>
      </div>
      <div class="modal-body">
        Are you sure you want to save changes? 
      </div>
      <div class="modal-footer">
           {!! Form::model($track, ['method' => 'PATCH', 'action' => ['TracksController@inplant', $track->id],  'files' => true, 'name' => 'autoSumForm' ]) !!} 
    {!! csrf_field() !!}
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>

         {!! Form::submit('Confirm', ['class' => 'btn btn-primary'])  !!}

         {!! Form::close() !!}

      </div>
    </div>
  </div>
</div>



@endif


@endforeach










</tbody>

</table>