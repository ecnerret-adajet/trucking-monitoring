<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
    	'name',
    	'operator',
    	'phone',
    	'phone_backup',
    	'avatar'
    ];

    public function trucks(){
    	return $this->belongsToMany('App\Truck');
    }

    /**
     * User created a driver model
     */
    public function user()
    {
        return $this->belongsTo('App\User');
    }
}
