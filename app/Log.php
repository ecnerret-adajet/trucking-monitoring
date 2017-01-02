<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Log extends Model
{

use \Venturecraft\Revisionable\RevisionableTrait;
    
    protected $fillable = [
        'name',
    	'location',
    	'dr_date',
    	'customer',
    	'customer_address',
    	'commodities',
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

    public function getDrDateAttribute($date)
    {
        return new Carbon($date);
    }

    /**
     * A log is belong to a truck
     */
    public function truck()
    {
    	return $this->belongsTo('App\Truck');
    }


    /**
     * Status model belongs to many Logs
     */
    public function statuses()
    {
        return $this->belongsToMany('App\Status')->withTimestamps();
    }

    public function getStatusListAttribute()
    {
        return $this->statuses->pluck('name')->all();
    }

 }
