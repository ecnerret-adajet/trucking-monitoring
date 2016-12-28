<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Customer extends Model
{
  protected $fillable= [
        'origin',
        'customer_name',
        'city',
        'province',
        'total_hours',
        'contact_number',
        'availability'
    ];
    
    
    public function tracks()
    {
        return $this->belongsToMany('App\Track');
    }

    /**
     * Customer belongs to user
     */
    public function user()
    {
        return $this->belongsTo('App\User');
    }

}
