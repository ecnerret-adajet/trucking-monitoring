<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\User;
use App\Track;
use App\Truck;
use App\Customer;
use Javascript;
use Datatables;

class PagesController extends Controller
{
     public function __construct()
    {
        $this->middleware('auth');
    }
  


   public function manage()
    {

           $tracks = Track::all();

        $trucks  = Truck::lists('plate_no','id');


        $locations  = Truck::pluck('location', 'id');
        $customers  = Customer::lists('customer_name', 'id');

      return view('tracks.manage', compact('tracks','trucks','locations','customers'));
    }

    public function documentation()
    {
      return view('tracks.documentation');
    }



    
   
}
