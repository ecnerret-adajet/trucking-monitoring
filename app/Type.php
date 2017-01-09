<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Type extends Model
{
    protected $fillable = [
    	'name'
    ];

    public function tracks()
    {
    	return $this->belongsToMany('App\Track');
    }

}
