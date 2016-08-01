<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Condition extends Model
{
    protected $fillable = [
    	'name'
    ];

    public function trucks()
    {
    	return $this->belongsToMany('App\Truck');
    }
}
