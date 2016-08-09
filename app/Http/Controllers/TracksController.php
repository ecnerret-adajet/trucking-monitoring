<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Requests\TrackRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Track;
use App\Truck;
use App\Customer;
use App\User;
use Carbon\Carbon;
use DB;
use Response;
use Input;
use DateTime;
use App\Schedule;

class TracksController extends Controller
{
      public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
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

      $schedules = Schedule::with('trucks')->get();
      $total = 0;

      $base_time = Carbon::now()->setTimezone('Asia/Manila');

       return view('tracks.index', 
        compact('tracks',
            'trucksx',
            'customersx',
            'base_time',
            'all_customers',
            'all_trucks',
            'users',
            'total',
            'trackings',
            'trucks',
            'customers',
            'in_plant',
            'transit_customer',
            'schedules',
            'in_customer',
            'transit_plant'));
    }





    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
   public function create()
    {
        $tracks = Track::all();
        $trucks = Truck::lists('plate_no','id');
        $customers = Customer::lists('customer_name','id');
        $base_time = Carbon::now('Asia/Manila');
        
        return view('tracks.create', 
            compact('trucks',
                'customers',
                'tracks'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */


    public function store(TrackRequest $request)
    {
        $track = Auth::user()->tracks()->create($request->all());

        
        $track->trucks()->attach($request->input('truck_list'));
        $track->customers()->attach($request->input('customer_list'));
        
        return redirect('tracks');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
