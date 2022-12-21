<?php

use App\Models\Area;
use App\Models\Order;
use App\Models\Place;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

//Route::get('/', function () {
//    return view('app');
//})->name('home');
Route::get('/test', function () {

});

Route::view('/giftcard', 'giftcard')->name('giftcard');
Route::view('/feedback/{order_id}', 'feedback')->name('feedback');
Route::view('/book/{place_id}', 'book')->name('book')->middleware('bill_paid');
Route::view('/{path?}/{path2?}', 'app')->name('home');
