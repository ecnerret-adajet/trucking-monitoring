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
        'help',
        'entry_plant',
        'back_plant'
    ];
    
    
    protected $dates = [
        'in_plant',
        'out_plant',
        'in_customer',
        'out_customer',
        'entry_plant',
        'base_time',
        'back_plant'
    ];


        
    /* user list */
    public function user()
    {
        return $this->belongsTo('App\User');
    }
    
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




     /* ENTRY PLANT */
    public function setEntryPlantAttribute()
    {
       $this->attributes['entry_plant'] = Carbon::parse()->setTimezone('Asia/Manila');
    }

    public function getEntryPlantAttribute($date)
    {
      return Carbon::parse($date);
    }
    

    /* IN PLANT */
    public function setInPlantAttribute($date)
    {
          $this->attributes['in_plant'] = Carbon::parse($date)->setTimezone('Asia/Manila');
    }

    public function getInPlantAttribute($date)
    {
         return Carbon::parse($date);
    }



    /* OUT PLANT */
    public function setOutPlantAttribute($date)
    {
          $this->attributes['out_plant'] =Carbon::parse($date)->setTimezone('Asia/Manila');   
    }

    public function getOutPlantAttribute($date)
    {
      return Carbon::parse($date);
    }


    /* IN CUSTOMER */
    public function setInCustomerAttribute($date)
    {
          $this->attributes['in_customer'] = Carbon::parse($date)->setTimezone('Asia/Manila');
    }

    public function getInCustomerAttribute($date)
    {
         return Carbon::parse($date);
    }


    /* OUT CUSTOMER */

    public function setOutCustomerAttribute($date)
    {
          $this->attributes['out_customer'] = Carbon::parse($date)->setTimezone('Asia/Manila');
    }

    public function getOutCustomerAttribute($date)
    {
        return Carbon::parse($date);
    }


    /* BACK PLANT */
    public function setBackPlantAttribute($date)
    {
          $this->attributes['back_plant'] = Carbon::parse($date)->setTimezone('Asia/Manila');
    }

    public function getBackPlantAttribute($date)
    {
       return Carbon::parse($date);
    }
  
    
   

}
