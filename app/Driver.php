<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
    	'name',
    	'driver_license',
    	'phone',
    	'phone_backup',
    	'address',
    	'avatar'
    ];

    public function trucks(){
    	return $this->belongsToMany('App\Truck');
    }
}
