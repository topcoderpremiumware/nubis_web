<?php

use App\Http\Controllers\TimetableController;
use App\Models\Area;
use App\Models\Order;
use App\Models\Place;
use App\Models\User;
use Illuminate\Support\Carbon;
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

Route::get('/change_lang/{locale}', function ($locale = null) {
    app()->setLocale($locale);
    session()->put('locale', $locale);
    return redirect()->back();
});
Route::view('/giftcard/{place_id}', 'giftcard')->name('giftcard');
Route::view('/feedback/{order_id}', 'feedback')->name('feedback');
Route::view('/feedbacks/{place_id}', 'feedbacks')->name('feedbacks');
Route::view('/book/{place_id}', 'book')->name('book')->middleware('bill_paid');
Route::view('/', 'home')->name('home');
Route::view('/pricing', 'pricing')->name('pricing');
Route::view('/features', 'features')->name('features');
Route::view('/about', 'about')->name('about');
Route::view('/admin/{path?}/{path2?}', 'app')->name('admin');
