<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Truck extends Model
{
   protected $fillable = [
        'location',
        'driver',
        'plate_no',
        'phone',
        'truck_type',
        'capacity',
        'vendor_name',
        'subcon_vendor',
        'type_goods',
        'truck_avatar',
        'vehicle_type'
    ];
    
    public function tracks()
    {
        return $this->belongsToMany('App\Track');
    }

    /* list all trucks */

    public function conditions()
    {
        return $this->belongsToMany('App\Condition')->withTimestamps();
    }

    public function getConditionListAttribute()
    {
        return $this->conditions->lists('id')->all();
    }


    public function status(){
        return $this->belongsToMany('App\Status');
    }
}
