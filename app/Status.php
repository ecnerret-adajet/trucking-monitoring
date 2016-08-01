<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    protected $table = 'statuses';

    protected $fillable = [
    'name'
    ];

    public function tracks()
   	{
   		return $this->belongsToMany('App\Track');
   	}

   	   public function trucks(){
        return $this->belongsToMany('App\Truck');
    }
}
