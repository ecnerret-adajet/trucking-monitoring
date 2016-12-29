<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Status extends Model
{
    protected $fillable = [
    	'name'
    ];

    public function logs()
    {
        return $this->belongsToMany('App\Log');
    }

}
