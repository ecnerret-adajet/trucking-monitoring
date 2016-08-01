<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Requests\TruckRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Customer;
use App\Truck;
use App\Track;
use Carbon\Carbon;
use User;
use Image;

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
        $trucks = Truck::all();
        return view('trucks.index', compact('trucks'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('trucks.create');
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

        if($request->hasFile('truck_avatar')){
            $truck_avatar = $request->file('truck_avatar');
            $filename = time() . '.' .$truck_avatar->getClientOriginalExtension();
            Image::make($truck_avatar)->resize(300,300)->save( public_path('/img/trucks/' . $filename ) ); 
            $truck->truck_avatar = $filename;
            $truck->save();
        }


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
        return view('trucks.show', compact('truck'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Truck $truck)
    {
        return view('trucks.edit',compact('truck'));
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

            if($request->hasFile('truck_avatar')){
            $truck_avatar = $request->file('truck_avatar');
            $filename = time() . '.' .$truck_avatar->getClientOriginalExtension();
            Image::make($truck_avatar)->resize(300,300)->save( public_path('/img/trucks/' . $filename ) ); 
            $truck->truck_avatar = $filename;
            $truck->save();
        }



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
        return redirect('trucks');
    }
}
