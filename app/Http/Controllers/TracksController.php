<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Requests\TrackRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Collection;
use App\Track;
use App\Truck;
use App\Customer;
use App\User;
use Carbon\Carbon;
use DB;
use Response;
use Input;
use DateTime;
use Flashy;
use App\Driver;

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

       $tracks = Track::latest('created_at')->where('created_at', '>=' ,Carbon::now()->subDays(2))->paginate(5);
 
       $drivers  = Driver::all();
       $users = User::all();
       $trucks  = Truck::lists('plate_no','id'); 
       $customers = Customer::lists('customer_name', 'id');
       $all_trucks = Truck::with('tracks')->get();
       $trackings = Track::orderBy('created_at', 'desc')->take(6)->get();

       $top_drivers = Truck::whereHas('tracks', function($q){
                        $q->orderBy('id','INCR');
                        })
                        ->take(6)
                        ->get();

       $top_region = Customer::whereHas('tracks', function($q){
                        $q->orderBy('id','INCR');
                    })
                    ->take(6)
                    ->get();






       $all_customers = Customer::has('tracks')
                ->take(5)
                ->get();


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
            'drivers',
            'top_drivers',
            'top_region'));
    }





    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
   public function create()
    {
       
       $customers  = Customer::lists('customer_name','id'); 
       $trucks  = Truck::where('availability',0)->lists('plate_no', 'id');
       $base_time = Carbon::now('Asia/Manila');
        
        return view('tracks.create', compact(
                'trucks',
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
        $initial_input['dispatch'] = Carbon::now()->setTimezone('Asia/Manila');
        $initial_input['availability'] = 1;

        $track = Auth::user()->tracks()->create($initial_input);
        $track->trucks()->attach($request->input('truck_list'));
        $track->customers()->attach($request->input('customer_list'));

        $tracks = Track::all();
        foreach($tracks as $track){
            foreach($track->trucks->reverse()->take(1) as $truck){
                    $id = $truck->id;
            }
       }

        $truck = Truck::findOrFail($id);
        $truck->availability = 1;
        $truck->save();

        flashy()->success('Dispatch Successfully !');
        return redirect('tracks');
    }


    /**
     * Manual Finish a truck hauler cycle
     */
    public function release($id, $back_id, Request $request)
    {
        $track = Track::findOrFail($id);
        $track->back_plant = Carbon::now();
        $track->save();

        $truck = Truck::findOrFail($back_id);
        $truck->availability = 0;
        $truck->save();

        flashy()->success('Successfully release a truck!');
        return redirect('trucks');
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

    public function editPlant(Track $track){

        $tracks = Track::latest('created_at')->where('created_at', '>=' ,Carbon::now()->subDays(2))->get();
        

        $tracks_archive = Track::orderBy('created_at', 'desc')->get();
        // latest('created_at')->where('created_at', '>=' ,Carbon::now())->get();
        $customers = Customer::with('tracks')->get();
        $trucks = Truck::with('tracks')->get();
        return view('tracks.editPlant', compact(
            'customers',
            'tracks_archive',  
            'trucks',
            'tracks',
            'track'));
    }

    public function markSafe(Track $track){
        $mark_safe['help'] = 0;
        $track->update($mark_safe);

        flashy()->success('you successfully marked a truck as safe!');
        return redirect('tracks');
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

    public function inplant(Request $request, Track $track){

        $entry_plants['entry_plant'] = Carbon::now()->setTimezone('Asia/Manila');
        $track->update($entry_plants);
        flashy()->success('Plant in Successfully !');
        return redirect()->back();
    }

    public function outplant(Request $request, Track $track){

        $out_plants['out_plant'] = Carbon::now()->setTimezone('Asia/Manila');
        $track->update($out_plants);
        flashy()->success('Plant out Successfully !');
        return redirect()->back();
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
