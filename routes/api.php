<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TableplanController;
use App\Http\Controllers\TimetableController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('register',[AuthApiController::class, 'register']);
Route::post('login',[AuthApiController::class, 'login']);

Route::post('customers/register',[CustomerController::class, 'register']);
Route::post('customers/login',[CustomerController::class, 'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::post('logout',[AuthApiController::class, 'logout']);
    Route::get('user',function(Request $request){
        return $request->user();
    });
    Route::post('user',[AuthApiController::class, 'save']);
    Route::post('user/language',[AuthApiController::class, 'language']);
    Route::post('user/password',[AuthApiController::class, 'password']);

    Route::post('settings',[SettingController::class, 'save']);
    Route::get('settings',[SettingController::class, 'get']);

    Route::post('places',[PlaceController::class, 'create']);
    Route::get('places',[PlaceController::class, 'getAll']);
    Route::get('places/mine',[PlaceController::class, 'getAllMine']);
    Route::get('places/{id}',[PlaceController::class, 'getId']);
    Route::post('places/{id}',[PlaceController::class, 'save']);
    Route::get('places/{place_id}/areas',[AreaController::class, 'getAllByPlace']);

    Route::post('roles',[RoleController::class, 'create']);
    Route::get('roles',[RoleController::class, 'getAll']);
    Route::post('user/{id}/roles',[AuthApiController::class, 'setRoles']);

    Route::post('tableplans',[TableplanController::class, 'create']);
    Route::get('tableplans/{id}',[TableplanController::class, 'getId']);
    Route::post('tableplans/{id}',[TableplanController::class, 'save']);

    Route::post('areas',[AreaController::class, 'create']);
    Route::get('areas/{id}',[AreaController::class, 'getId']);
    Route::post('areas/{id}',[AreaController::class, 'save']);
    Route::get('areas/{area_id}/working',[TimetableController::class, 'getWorkingByAreaAndDate']);

    Route::post('timetables',[TimetableController::class, 'create']);
    Route::get('timetables/{id}',[TimetableController::class, 'getId']);
    Route::post('timetables/{id}',[TimetableController::class, 'save']);

    Route::post('customers/logout',[CustomerController::class, 'logout']);
    Route::get('customers',function(Request $request){
        return $request->user();
    });
    Route::post('customers',[CustomerController::class, 'save']);
    Route::post('customers/language',[CustomerController::class, 'language']);
    Route::post('customers/password',[CustomerController::class, 'password']);
});
