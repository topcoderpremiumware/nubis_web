<?php

use App\Http\Controllers\TimetableController;
use App\Models\Area;
use App\Models\Giftcard;
use App\Models\Order;
use App\Models\Place;
use App\Models\User;
use App\Models\VideoGuide;
use Dompdf\Options;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use Dompdf\Dompdf;

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
    $options = new Options();
    $options->set('enable_remote', TRUE);
    $options->set('enable_css_float', TRUE);
    $options->set('enable_html5_parser', FALSE);
    $dompdf = new Dompdf($options);
    $dompdf->loadHtml('
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
        <style>
        /*@page{
            margin: 0px;
        }*/
        body{
            font-family: "Poppins", sans-serif;
            margin:0;
            background-image: url(https://dinner-book.vasilkoff.info/images/features-bg.jpg);
            background-repeat: no-repeat;
            background-size: cover;
            position: relative;
            padding: 51px 50px 58px;
        }
        h2{
            text-align: center;
            font-size: 50px;
            color: #F36823;
            margin: 0 0 20px;
        }
        h3{
            text-align: center;
            font-size: 30px;
            margin: 0 0 20px;
        }
        .hr_c{
            border-top: 3px solid #F36823;
            margin: 0 auto 100px;
            width: 300px;
        }
        .value{
            text-align: center;
            font-size: 30px;
            margin: 0 0 0px;
        }
        .amount{
            text-align: center;
            font-size: 50px;
            margin: 0 0 20px;
        }
        .contact{
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            text-align: center;
            padding: 10px;
        }
        .bottom_img{
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            opacity: 30%;
        }
        </style>
        <body><h2>McDonalds</h2><h3>GIFTCARD</h3><div class="hr_c"></div><div class="value">Value</div><div class="amount">100 DKK</div><p><b>Code:</b> jJHkgk4</p><p><b>Valid until:</b> 03.12.2025</p><div class="contact">McDonalds | Borgergade 20 - 9000 Aalborg | +45 52509752 | www.rositas.dk</div><img class="bottom_img" src="https://dinner-book.vasilkoff.info/storage/19/02%20WEEK%20P%C3%A6re.jpg"></body>');
    $dompdf->setPaper('A4', /*'landscape'*/);
    $dompdf->render();
    $dompdf->stream('example.pdf'/*, array("Attachment" => false)*/);
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
Route::view('/contact', 'contact')->name('contact');
Route::get('/thank-you/giftcard/{code}', function($code){
    $giftcard = Giftcard::where('code',$code)->firstOrFail();
    return view('thankyou-giftcard', ['giftcard' => $giftcard]);
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
