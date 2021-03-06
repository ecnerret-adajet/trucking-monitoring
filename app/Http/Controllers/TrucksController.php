<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Requests\TruckRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Collection;
use App\Customer;
use App\Truck;
use App\Track;
use Carbon\Carbon;
use User;
use Image;
use Flashy;
use App\Driver;
use App\Assignment;
use App\Status;
use App\Log;
use App\Condition;

class TrucksController extends Controller
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
        $trucks = Truck::orderBy('created_at','INCR')->get();
        $stats = Status::pluck('name', 'name');
        $conditions = Condition::pluck('name','id');
        return view('trucks.index', compact('trucks','stats','conditions'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $drivers = Driver::lists('name','id');
        $assignments = Assignment::lists('name','id');
        return view('trucks.create', compact('drivers','assignments'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(TruckRequest $request)
    {
          $truck = Auth::user()->trucks()->create($request->all());
          $truck->drivers()->attach($request->input('driver_list'));
          $truck->assignments()->attach($request->input('assignment_list'));

          flashy()->success('Sucessfully Added new truck!');
          return redirect('trucks');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Truck $truck)
    {
        $base_time = Carbon::now()->setTimezone('Asia/Manila');

        return view('trucks.show', compact('truck','base_time'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Truck $truck)
    {
        $drivers = Driver::lists('name','id');
         $assignments = Assignment::lists('name','id');
        return view('trucks.edit',compact('truck','drivers','assignments'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(TruckRequest $request, Truck $truck)
    {
        $truck->update($request->all());

        $truck->drivers()->sync( (array) $request->get('driver_list') );
        $truck->assignments()->sync( (array) $request->get('assignment_list') );

        flashy()->success('truck successfully updated !');
        return redirect('trucks');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Truck $truck)
    {
        $truck->delete();
        flashy()->success('Successfully deleted a truck!');
        return redirect('trucks');
    }

}
