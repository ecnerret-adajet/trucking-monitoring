<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
    	'name'
    ];

    public function trucks()
   	{
   		return $this->belongsToMany('App\Truck');
   	}

   	public function customers()
   	{
   		return $this->belongsToMany('App\Customer');
   	}
}
