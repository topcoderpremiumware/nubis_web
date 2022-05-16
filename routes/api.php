<?php

use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TableplanController;
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

    Route::post('roles',[RoleController::class, 'create']);
    Route::get('roles',[RoleController::class, 'getAll']);
    Route::post('user/{id}/roles',[AuthApiController::class, 'setRoles']);

    Route::post('tableplans',[TableplanController::class, 'create']);
    Route::get('tableplans/{id}',[TableplanController::class, 'getId']);
    Route::post('tableplans/{id}',[TableplanController::class, 'save']);
});
