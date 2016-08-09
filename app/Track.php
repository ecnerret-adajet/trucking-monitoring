<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Track extends Model
{
  protected $fillable = [
        'in_plant',
        'out_plant',
        'in_customer',
        'out_customer',
        'back_plant',
    ];
    
    
    protected $dates = [
        'in_plant',
        'out_plant',
        'in_customer',
        'out_customer',
        'base_time',
        'back_plant',
    ];


    
    
    /* list all trucks */
    public function trucks()
    {
        return $this->belongsToMany('App\Truck')->withTimestamps();
    }
    
    public function getTruckListAttribute()
    {
        return $this->trucks->lists('id')->all();
    }
    
    
    /* list all customer */
    public function customers()
    {
        return $this->belongsToMany('App\Customer')->withTimestamps();
    }
    
    public function getCustomerListAttribute()
    {
        return $this->customers->lists('id')->all();
    }
    


    
    /*out plant*/
    public function getOutPlantAttribute($date)
    {
        return new Carbon($date);
    }
    
    public function setOutPlantAttribute($date)
    {
        $this->attributes['out_plant'] = Carbon::parse()->setTimezone('Asia/Manila');
    }



    /* Plant In */
     public function getInPlantAttribute($date)
    {
        return new Carbon($date);
    }
    
    public function setInPlantAttribute($date)
    {
        $this->attributes['in_plant'] = Carbon::parse()->setTimezone('Asia/Manila');
    }

    
      /* In Customer */
     public function getInCustomerAttribute($date)
    {
        return new Carbon($date);
    }
    
    public function setInCustomerAttribute($date)
    {
        $this->attributes['in_customer'] = Carbon::parse()->setTimezone('Asia/Manila');
    }

    
    
      /* Out Customer */
     public function getOutCustomerAttribute($date)
    {
        return new Carbon($date);
    }
    
    public function setOutCustomerAttribute($date)
    {
        $this->attributes['out_customer'] = Carbon::parse()->setTimezone('Asia/Manila');
    }


         /* Out Customer */
     public function getBackPlantAttribute($date)
    {
        return new Carbon($date);
    }
    
    public function setBackPlantAttribute($date)
    {
        $this->attributes['back_plant'] = Carbon::parse()->setTimezone('Asia/Manila');
    }
    

    
    
    /* user list */
    public function user()
    {
        return $this->belongsTo('App\User');
    }



    

}
