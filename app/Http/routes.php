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

Route::auth(); 

Route::group(['middleware' => ['auth']], function() {

Route::resource('tracks','TracksController');    
Route::resource('customers','CustomersController');  
Route::resource('trucks','TrucksController');  
Route::resource('users','UserController'); 


Route::get('roles',['as'=>'roles.index','uses'=>'RoleController@index','middleware' => ['permission:role-list|role-create|role-edit|role-delete']]);
Route::get('roles/create',['as'=>'roles.create','uses'=>'RoleController@create','middleware' => ['permission:role-create']]);
Route::post('roles/create',['as'=>'roles.store','uses'=>'RoleController@store','middleware' => ['permission:role-create']]);
Route::get('roles/{id}',['as'=>'roles.show','uses'=>'RoleController@show']);
Route::get('roles/{id}/edit',['as'=>'roles.edit','uses'=>'RoleController@edit','middleware' => ['permission:role-edit']]);
Route::patch('roles/{id}',['as'=>'roles.update','uses'=>'RoleController@update','middleware' => ['permission:role-edit']]);
Route::delete('roles/{id}',['as'=>'roles.destroy','uses'=>'RoleController@destroy','middleware' => ['permission:role-delete']]); 


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
Route::get('/documentation', 'PagesController@documentation');

});
