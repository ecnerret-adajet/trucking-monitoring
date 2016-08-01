<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::group(['middleware' => ['web']], function () {
    Route::get('/', function () {
    return view('auth.login');
});


Route::auth(); 

Route::resource('tracks','TracksController');    
Route::resource('customers','CustomersController');  
Route::resource('trucks','TrucksController');  


Route::get('api/customers', function() {
	return App\Customer::latest()->get();
});
Route::get('api/trucks', function() {
	return App\Truck::latest()->get();
});


Route::get('/home', 'HomeController@index');
    
Route::get('/reports', 'HomeController@report');
Route::post('/reports', 'HomeController@getreport');

Route::get('/manage', 'PagesController@manage');
});
