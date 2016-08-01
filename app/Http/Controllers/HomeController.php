<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Track;
use App\Truck;
use App\Customer;
use App\User;
use App\Status;
use Carbon\Carbon;
use DB;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('home');
    }

    public function report()
    {
  $tracks = Track::orderBy('created_at','desc')->get();

       $users = User::all();
       $trucks  = Truck::lists('plate_no','id'); 
       $customers = Customer::lists('customer_name', 'id');
       
       $all_trucks = Truck::with('tracks')->get();
       $trackings = Track::orderBy('created_at', 'desc')->take(6)->get();
       $all_customers = Customer::has('tracks')
                ->take(5)
                ->get();

      $in_plant = Status::where('id', '=', '1')->get();
      $transit_customer = Status::where('id', '=', '2')->get();
      $in_customer = Status::where('id', '=', '3')->get();
      $transit_plant = Status::where('id', '=', '4')->get();

      $statuses = Status::lists('name','id');

      $base_time = Carbon::now();

       return view('report', 
        compact('tracks',
            'trucksx',
            'customersx',
            'base_time',
            'all_customers',
            'all_trucks',
            'users',
            'trackings',
            'trucks',
            'customers',
            'in_plant',
            'transit_customer',
            'in_customer',
            'transit_plant',
            'statuses'));
    }


    public function getreport(Request $request)
    {
         $this->validate($request, [
            'start_date' => 'required',
            'end_date' => 'required'
        ]); 
         $base_time = Carbon::now('Asia/Manila');
         $customers = Customer::all();
         $trucks = Truck::all();
         $start_date = $request->get('start_date');
         $end_date = $request->get('end_date');
       
        
        $tracks = Track::where(DB::raw('DATE_FORMAT(created_at,"%Y-%m-%d")'),'>=',$start_date)
            ->where(DB::raw('DATE_FORMAT(created_at,"%Y-%m-%d")'),'<=',$end_date)
            ->get();
        
        return redirect('reports', compact(
            'tracks',
            'customers',
            'trucks',
            'end_date',
            'base_time',
            'start_date'
        ));
    }
}
