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



 Route::get('/', function () {
 	return view('auth.login');
});

 /**
 * START Trucking Monitoring SMS Notification
 */
Route::get('/smsnotification', 'SmsNotificationsController@sms');
Route::auth(); 
Route::group(['middleware' => ['auth']], function() {
/**
 * Tracks setup routes
 */
Route::resource('tracks','TracksController');
/**
 * customer setup routes
 */
Route::resource('customers','CustomersController');  
/**
 * Trucks controller setup
 */
Route::resource('trucks','TrucksController'); 
/**
 * drivers controller setup
 */
Route::resource('drivers','DriversController'); 
/**
 * User controller route setup
 */
Route::resource('users','UserController'); 

Route::get('/edit-plant', 'TracksController@editPlant');
Route::patch('/in/{tracks}','TracksController@inplant');
Route::patch('/out/{tracks}','TracksController@outplant');
Route::patch('/safe/{tracks}', 'TracksController@markSafe');


Route::get('roles',['as'=>'roles.index','uses'=>'RoleController@index','middleware' => ['permission:role-list|role-create|role-edit|role-delete']]);
Route::get('roles/create',['as'=>'roles.create','uses'=>'RoleController@create','middleware' => ['permission:role-create']]);
Route::post('roles/create',['as'=>'roles.store','uses'=>'RoleController@store','middleware' => ['permission:role-create']]);
Route::get('roles/{id}',['as'=>'roles.show','uses'=>'RoleController@show']);
Route::get('roles/{id}/edit',['as'=>'roles.edit','uses'=>'RoleController@edit','middleware' => ['permission:role-edit']]);
Route::patch('roles/{id}',['as'=>'roles.update','uses'=>'RoleController@update','middleware' => ['permission:role-edit']]);
Route::delete('roles/{id}',['as'=>'roles.destroy','uses'=>'RoleController@destroy','middleware' => ['permission:role-delete']]); 


Route::get('/home', 'HomeController@index');
    

Route::get('/summary', 'HomeController@report');
Route::get('/report', 'HomeController@getreport');

Route::get('/manage', 'PagesController@manage');
Route::get('/documentation', 'PagesController@documentation');




});
