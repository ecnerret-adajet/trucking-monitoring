<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Collection;
use Carbon\Carbon;
use Flashy;
use App\Odometer;
use App\Truck;

class OdometersController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create($id)
    {
        return view('odometers.create', compact('id'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store($id, Request $request)
    {
        $truck = Truck::findOrFail($id);

        $odometer = new Odometer;
        $odometer->odometer_count = $request->input('odometer_count');
        $odometer->distance_travel = $request->input('distance_travel');
        $odometer->fuel_loaded = $request->input('fuel_loaded');
        $odometer->truck()->associate($truck);
        $odometer->save();

        flashy()->success('Odometer successfully updated!');
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
    public function edit(Odometer $odometer)
    {
        return view('odometers.edit', compact('odometer'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Odometer $odometer)
    {
        $odometer->update($request->all());
        flashy()->success('Odometer successfully updated!');
        return redirect('trucks');
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
