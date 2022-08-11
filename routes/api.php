<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CustomBookingLengthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DishController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\GiftcardController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MessageTemplateController;
use App\Http\Controllers\OrderController;
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
Route::post('customers/verify',[CustomerController::class, 'checkEmail']);

Route::get('places',[PlaceController::class, 'getAll']);

Route::get('free_dates',[OrderController::class, 'freeDates']);
Route::get('free_time',[OrderController::class, 'freeTime']);
Route::get('work_dates',[OrderController::class, 'workDates']);
Route::get('work_time',[OrderController::class, 'workTime']);
Route::get('places/{place_id}/areas',[AreaController::class, 'getAllByPlace']);
Route::get('places/{place_id}/lengths',[CustomBookingLengthController::class, 'getAllByParams']);

Route::get('files_purpose',[FileController::class, 'getByPurpose']);
Route::get('countries',[CountryController::class, 'getAll']);

Route::get('custom_booking_lengths',[CustomBookingLengthController::class, 'getAllByParams']);

Route::middleware('auth:customer_api')->group(function(){
    Route::post('customers/logout',[CustomerController::class, 'logout']);
    Route::get('customers',function(Request $request){
        return $request->user();
    });
    Route::post('customers',[CustomerController::class, 'save']);
    Route::post('customers/language',[CustomerController::class, 'language']);
    Route::post('customers/password',[CustomerController::class, 'password']);
    Route::get('customers/orders',[OrderController::class, 'getAllByCustomer']);

    Route::post('make_order',[OrderController::class, 'makeOrder']);
    Route::delete('cancel_order/{id}',[OrderController::class, 'cancel']);
});
Route::middleware('auth:user_api')->group(function(){
    Route::post('logout',[AuthApiController::class, 'logout']);
    Route::get('user',function(Request $request){
        return $request->user();
    });
    Route::post('user',[AuthApiController::class, 'save']);
    Route::post('user/language',[AuthApiController::class, 'language']);
    Route::post('user/password',[AuthApiController::class, 'password']);
    Route::post('user/{id}/roles',[AuthApiController::class, 'setRoles']);
    Route::get('user/{id}/roles',[AuthApiController::class, 'getRoles']);

    Route::post('settings',[SettingController::class, 'save']);
    Route::get('settings',[SettingController::class, 'get']);

    Route::post('places',[PlaceController::class, 'create']);
    Route::get('places/mine',[PlaceController::class, 'getAllMine']);
    Route::post('places/{id}',[PlaceController::class, 'save']);
    Route::get('places/{place_id}/menus',[MenuController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/tableplans',[TableplanController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/timetables',[TimetableController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/custom_booking_lengths',[CustomBookingLengthController::class, 'getAllByPlace']);

    Route::post('roles',[RoleController::class, 'create']);
    Route::get('roles',[RoleController::class, 'getAll']);

    Route::post('tableplans',[TableplanController::class, 'create']);
    Route::get('tableplans/{id}',[TableplanController::class, 'getId']);
    Route::post('tableplans/{id}',[TableplanController::class, 'save']);
    Route::delete('tableplans/{id}',[TableplanController::class, 'delete']);

    Route::post('areas',[AreaController::class, 'create']);
    Route::get('areas/{id}',[AreaController::class, 'getId']);
    Route::post('areas/{id}',[AreaController::class, 'save']);
    Route::get('areas/{area_id}/working',[TimetableController::class, 'getWorkingByAreaAndDate']);
    Route::delete('areas/{id}',[AreaController::class, 'delete']);

    Route::post('timetables',[TimetableController::class, 'create']);
    Route::get('timetables/{id}',[TimetableController::class, 'getId']);
    Route::post('timetables/{id}',[TimetableController::class, 'save']);
    Route::delete('timetables/{id}',[TimetableController::class, 'delete']);

    Route::post('orders',[OrderController::class, 'create']);
    Route::get('orders/{id}',[OrderController::class, 'getId']);
    Route::post('orders/{id}',[OrderController::class, 'save']);
    Route::get('orders',[OrderController::class, 'getAllByParams']);
    Route::delete('orders/{id}',[OrderController::class, 'delete']);
    Route::post('orders/{id}/status',[OrderController::class, 'setStatus']);

    Route::post('dishes',[DishController::class, 'create']);
    Route::get('dishes/{id}',[DishController::class, 'getId']);
    Route::post('dishes/{id}',[DishController::class, 'save']);
    Route::get('dishes',[DishController::class, 'getAll']);

    Route::post('menus',[MenuController::class, 'create']);
    Route::get('menus/{id}',[MenuController::class, 'getId']);
    Route::post('menus/{id}',[MenuController::class, 'save']);
    Route::post('menus/{id}/dishes',[MenuController::class, 'setDishes']);

//    Route::post('message_tempates',[MessageTemplateController::class, 'create']);
    Route::get('message_tempates/{purpose}',[MessageTemplateController::class, 'getId']);
    Route::post('message_tempates/{purpose}',[MessageTemplateController::class, 'save']);
    Route::get('message_tempates',[MessageTemplateController::class, 'getAllByPlace']);

    Route::post('giftcards',[GiftcardController::class, 'create']);
    Route::get('giftcards/{id}',[GiftcardController::class, 'getId']);
    Route::post('giftcards/{id}',[GiftcardController::class, 'save']);
    Route::get('giftcards',[GiftcardController::class, 'getAllByPlace']);
    Route::get('giftcards_check',[GiftcardController::class, 'getByCode']);
    Route::post('giftcards_spend',[GiftcardController::class, 'spend']);

    Route::post('coupons',[CouponController::class, 'create']);
    Route::get('coupons/{id}',[CouponController::class, 'getId']);
    Route::post('coupons/{id}',[CouponController::class, 'save']);
    Route::get('coupons',[CouponController::class, 'getAllByPlace']);
    Route::get('coupons_check',[CouponController::class, 'getByCode']);
    Route::delete('coupons',[CouponController::class, 'delete']);

    Route::post('feedbacks',[FeedbackController::class, 'create']);
    Route::get('feedbacks/{id}',[FeedbackController::class, 'getId']);
    Route::post('feedbacks/{id}',[FeedbackController::class, 'save']);
    Route::get('feedbacks',[FeedbackController::class, 'getAllByPlace']);
    Route::get('feedbacks_public',[FeedbackController::class, 'getAllPublic']);

    Route::post('files',[FileController::class, 'create']);
    Route::get('files/{id}',[FileController::class, 'getId']);
    Route::post('files/{id}',[FileController::class, 'save']);
    Route::get('files',[FileController::class, 'getAllByPlace']);

    Route::post('custom_booking_lengths',[CustomBookingLengthController::class, 'create']);
    Route::get('custom_booking_lengths/{id}',[CustomBookingLengthController::class, 'getId']);
    Route::post('custom_booking_lengths/{id}',[CustomBookingLengthController::class, 'save']);
    Route::delete('custom_booking_lengths/{id}',[CustomBookingLengthController::class, 'delete']);
});

Route::get('places/{id}',[PlaceController::class, 'getId']);
