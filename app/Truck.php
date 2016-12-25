<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Truck extends Model
{
   protected $fillable = [
            'operator',
            'origin',
            'plate_no',
            'vehicle_type',
            'capacity',
            'availability',
    ];


    /**
     * Set truck belongs to user
     */
    public function user(){
        return $this->belongsTo('App\User');
    }
    
    /**
     * Set truck model belongsToMany to tracks model
     */
    public function tracks()
    {
        return $this->belongsToMany('App\Track');
    }

    public function setPlateNoAttribute($value)
    {
        $this->attributes['plate_no'] = strtoupper($value);
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

    /* list all trucks */
    public function drivers(){
        return $this->belongsToMany('App\Driver')->withTimestamps();
    }

    public function getDriverListAttribute()
    {
        return $this->drivers->pluck('id')->all();
    }


    /* list all schdule trucks */
    public function schedules()
    {
        return $this->belongsToMany('App\Schedule')->withTimestamps();
    }

    public function getScheduleListAttribute()
    {
        return $this->schedules->lists('id')->all();
    }
}
