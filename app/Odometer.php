<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Odometer extends Model
{
    protected $fillable = [
    	'odometer_count',
    	'distance_travel',
    	'fuel_loaded'
    ];

    public function truck()
    {
    	return $this->belongsTo('App\Truck');
    }
}
