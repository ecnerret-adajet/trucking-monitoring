<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Status extends Model
{
    protected $fillable = [
    	'name',
    	'location',
    	'dr_date',
    	'customer',
    	'customer_address',
    	'commodities',
    	'remarks'
    ];

    protected $dates = [
    	'dr_date'
    ];

    /**
     * Set dr_date attribute
     */
    public function setDrDateAttribute($date)
    {
    	$this->attributes['dr_date'] = Carbon::parse($date);
    }

    public function trucks()
    {
    	return $this->belongsToMany('App\Truck');
    }


}
