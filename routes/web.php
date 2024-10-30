<?php

use App\Http\Controllers\SwedbankWebhookController;
use App\Jobs\SwedbankPayment;
use App\Models\Giftcard;
use App\Models\Order;
use App\Models\VideoGuide;
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

Route::any('/EPASSaleToPOI/3.1', [SwedbankWebhookController::class, 'webhook']);

Route::get('/change_lang/{locale}', function ($locale = null) {
    app()->setLocale($locale);
    session()->put('locale', $locale);
    return redirect()->back();
});
Route::view('/giftcard/{place_id}', 'new_giftcard')->name('giftcard');
Route::view('/feedback/{order_id}', 'feedback')->name('feedback');
Route::view('/feedbacks/{place_id}', 'feedbacks')->name('feedbacks');
Route::view('/terms', 'terms')->name('terms');
Route::view('/book/{place_id}', 'book')->name('book')->middleware('bill_paid');
Route::view('/', 'home')->name('home');
Route::view('/pricing', 'pricing')->name('pricing');
Route::view('/features', 'features')->name('features');
Route::view('/about', 'about')->name('about');
Route::view('/contact', 'contact')->name('contact');
Route::get('/thank-you/giftcard/{code}', function($code){
    $giftcards = Giftcard::whereIn('id',explode(',',base64_decode($code)))->get();
    return view('thankyou-giftcard', ['giftcards' => $giftcards]);
});
Route::get('/thank-you/order/{order_id}', function($order_id){
    $order = Order::findOrFail($order_id);
    return view('thankyou-order', ['order' => $order]);
});
Route::get('/video-guide', function(){
    $guides = VideoGuide::where('language',app()->getLocale())->get();
    return view('videoGuide', ['guides' => $guides]);
})->name('videoGuide');
Route::view('/admin/{path?}/{path2?}', 'app')->name('admin');
