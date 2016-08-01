<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Customer extends Model
{
  protected $fillable= [
        'origin',
        'customer_name',
        'destination',
        'time_to_customer',
        'time-to_origin',
        'phones',
        'total_hours'
    ];
    
    
    public function tracks()
    {
        return $this->belongsToMany('App\Track');
    }



}
