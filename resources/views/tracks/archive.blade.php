

<table class="table table-bordered table-hover" style=" border: 2px solid #3498db;
  border-radius: 3px;
  background-color: #fff;">
<thead>
<tr class="info">
  <th>ID #</th>
  <th>Plate Number</th>
  <th>Destination</th>
  <th>ALT Dispatch</th>
  <th>Plant in</th>
  <th>Plant out</th>
</tr>
</thead>
<tbody>
@forelse($tracks as $track)

<tr>
<td>{{ $track->id }} </td>
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


<td class="{{ ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'danger' : ''  ) }}">
       {{  ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '' : $track->dispatch->toFormattedDateString().' - '   ) }} 
       {{  ($track->dispatch->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->dispatch->format('h:i:s A')   ) }}

</td>

<td class="{{ ($track->entry_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'danger' : ''  ) }}">
     {{  ($track->entry_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '' : $track->entry_plant->toFormattedDateString().' - '   ) }} 
       {{  ($track->entry_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->entry_plant->format('h:i:s A')   ) }}
</td>

<td class="{{ ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'danger' : ''  ) }}">
    {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? '' : $track->out_plant->toFormattedDateString().' - '   ) }} 
       {{  ($track->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'NO TIME' : $track->out_plant->format('h:i:s A')   ) }}
</td>

</tr>


  





@empty


<tr>
    <td colspan="6">
        <em>
    <h3 class="text-center" style="font-weight: bold">No Archive for this day!</h3>
</em>
    </td>
</tr>






@endforelse

</tbody>

</table>