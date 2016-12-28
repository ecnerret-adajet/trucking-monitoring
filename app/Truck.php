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
            'odometer',
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
    public function drivers(){
        return $this->belongsToMany('App\Driver')->withTimestamps();
    }

    public function getDriverListAttribute()
    {
        return $this->drivers->pluck('id')->all();
    }

    /**
     * List assignment model to trucks model
     */
    public function assignments()
    {
        return $this->belongsToMany('App\Assignment')->withTimestamps();
    }

    public function getAssignmentListAttribute()
    {
        return $this->assignements->pluck('id')->all();
    }

    /**
     * Status model belongs to many truck model
     */
    public function statuses()
    {
        return $this->belongsToMany('App\Status')->withTimestamps();
    }

    public function getStatusListAttribute()
    {
        return  $this->statuses->pluck('id')->all();
    }
}
