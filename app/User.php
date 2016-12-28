<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Zizaco\Entrust\Traits\EntrustUserTrait;

class User extends Authenticatable
{
     use EntrustUserTrait;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password','avatar'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];



    public function tracks()
    {
        return $this->hasMany('App\Track');
    }

    public function trucks()
    {
        return $this->hasMany('App\Truck');
    }

    public function drivers()
    {
        return $this->hasMany('App\Driver');
    }

    public function customers()
    {
        return $this->hasMany('App\Customer');
    }
}
