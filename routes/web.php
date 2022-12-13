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
//    $stripe = new \Stripe\StripeClient(env('STRIPE_SECRET'));
//    $link = $stripe->paymentLinks->create(
//        [
//            'line_items' => [['price' => 'price_1MED982eZvKYlo2CZLQdP554', 'quantity' => 1]],
//            'after_completion' => [
//                'type' => 'redirect',
//                'redirect' => ['url' => env('APP_URL')],
//            ],
//        ]
//    );
////    $products = $stripe->prices->all();
//    echo '<pre>';
//    var_dump($link->url);
//    echo '</pre>';
});

Route::view('/giftcard', 'giftcard')->name('giftcard');
Route::view('/feedback/{order_id}', 'feedback')->name('feedback');
Route::view('/book/{place_id}', 'book')->name('book');
Route::view('/{path?}/{path2?}', 'app')->name('home');
