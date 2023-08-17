<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\BillingController;
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
use App\Http\Controllers\OrderWebhookController;
use App\Http\Controllers\PaidMessageController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TableplanController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\VideoGuideController;
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
Route::post('forgot_password',[AuthApiController::class, 'forgot']);
Route::post('reset_password',[AuthApiController::class, 'reset']);

Route::post('customers/register',[CustomerController::class, 'register']);
Route::post('customers/login',[CustomerController::class, 'login']);
Route::post('customers/verify',[CustomerController::class, 'checkEmail']);
Route::post('customers/forgot_password',[CustomerController::class, 'forgot']);
Route::post('customers/reset_password',[CustomerController::class, 'reset']);

Route::get('places',[PlaceController::class, 'getAll']);

Route::get('free_dates',[OrderController::class, 'freeDates']);
Route::get('free_time',[OrderController::class, 'freeTime']);
Route::get('free_tables',[OrderController::class, 'freeTables']);
Route::get('work_dates',[OrderController::class, 'workDates']);
Route::get('work_time',[OrderController::class, 'workTime']);
Route::get('places/{place_id}/areas',[AreaController::class, 'getAllByPlace']);
Route::get('places/{place_id}/lengths',[CustomBookingLengthController::class, 'getAllByParams']);
Route::get('places/{place_id}/is_bill_paid',[PlaceController::class, 'isBillPaid']);
Route::get('places/{place_id}/bill_paid_status',[PlaceController::class, 'getBillPaidStatus']);
Route::get('places/{place_id}/message_limit',[PlaceController::class, 'getPaidMessages']);
Route::get('places/{place_id}/alternative',[PlaceController::class, 'getAlternative']);
Route::get('places/{place_id}/payment_method',[OrderController::class, 'getPlacePaymentMethod']);
Route::get('places/{place_id}/max_available_seats',[PlaceController::class, 'getMaxAvailableSeats']);
Route::get('places/{place_id}/online_booking_description',[OrderController::class, 'getPlaceOnlineBookingDescription']);
Route::get('places/{place_id}/online_booking_title',[OrderController::class, 'getPlaceOnlineBookingTitle']);
Route::post('places/{place_id}/send_contact',[PlaceController::class, 'sendContact']);

Route::get('files_purpose',[FileController::class, 'getByPurpose']);
Route::get('countries',[CountryController::class, 'getAll']);

Route::get('custom_booking_lengths',[CustomBookingLengthController::class, 'getAllByParams']);

Route::post('feedbacks',[FeedbackController::class, 'create']);
Route::post('feedbacks/is_exist',[FeedbackController::class, 'isFeedbackExist']);
Route::post('send_admin_contact',[PlaceController::class, 'sendtoAdmin']);

Route::middleware('auth:customer_api')->group(function(){
    Route::post('customers/logout',[CustomerController::class, 'logout']);
    Route::get('customers',function(Request $request){
        return $request->user();
    });
    Route::post('customers',[CustomerController::class, 'save']);
    Route::post('customers/language',[CustomerController::class, 'language']);
    Route::post('customers/password',[CustomerController::class, 'password']);
    Route::get('customers/orders',[OrderController::class, 'getAllByCustomer']);
    Route::get('customers/client_secret',[OrderController::class, 'getStripeClientSecret']);
    Route::get('customers/all',[CustomerController::class, 'allCustomers']);



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
    Route::post('user/role',[AuthApiController::class, 'setRole']);
    Route::get('user/role',[AuthApiController::class, 'getRole']);
    Route::delete('user/role',[AuthApiController::class, 'deleteRole']);

    Route::post('settings',[SettingController::class, 'save']);
    Route::get('settings',[SettingController::class, 'get']);

    Route::post('places',[PlaceController::class, 'create']);
    Route::get('places/mine',[PlaceController::class, 'getAllMine']);
    Route::post('places/send_support',[PlaceController::class, 'sendSupport']);
    Route::post('places/{id}',[PlaceController::class, 'save']);
    Route::get('places/{place_id}/menus',[MenuController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/tableplans',[TableplanController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/timetables',[TimetableController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/custom_booking_lengths',[CustomBookingLengthController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/customers',[PlaceController::class, 'getCustomers']);
    Route::get('places/{place_id}/users',[PlaceController::class, 'getUsers']);
    Route::get('places/{place_id}/is_trial_paid',[PlaceController::class, 'isTrialBillPaid']);
    Route::post('places/{place_id}/pay_trial',[BillingController::class, 'payTrial']);
    Route::get('places/{place_id}/billings',[BillingController::class, 'getAllByPlace']);
    Route::post('places/{place_id}/pay_messages_trial',[PaidMessageController::class, 'payTrial']);
    Route::get('places/{place_id}/paid_messages',[PaidMessageController::class, 'getAllByPlace']);
    Route::delete('places/{id}',[PlaceController::class, 'delete']);

    Route::get('check_customer',[CustomerController::class, 'getByEmail']);

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
    Route::post('orders_switch_tables',[OrderController::class, 'switchTables']);

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
    Route::post('message_tempates_test_sms',[MessageTemplateController::class, 'sendTestSms']);
    Route::post('message_tempates_test_email',[MessageTemplateController::class, 'sendTestEmail']);

    Route::get('giftcards/{id}',[GiftcardController::class, 'getId']);
    Route::post('giftcards/{id}',[GiftcardController::class, 'save']);
    Route::get('giftcards',[GiftcardController::class, 'getAllByPlace']);
    Route::post('giftcards_admin',[GiftcardController::class, 'createAdmin']);

    Route::post('coupons',[CouponController::class, 'create']);
    Route::get('coupons/{id}',[CouponController::class, 'getId']);
    Route::post('coupons/{id}',[CouponController::class, 'save']);
    Route::get('coupons',[CouponController::class, 'getAllByPlace']);
    Route::get('coupons_check',[CouponController::class, 'getByCode']);
    Route::delete('coupons',[CouponController::class, 'delete']);


    Route::get('feedbacks/{id}',[FeedbackController::class, 'getId']);
    Route::post('feedbacks/{id}',[FeedbackController::class, 'save']);
    Route::get('feedbacks',[FeedbackController::class, 'getAllByPlace']);
    Route::post('feedbacks/{id}/reply',[FeedbackController::class, 'makeReply']);

    Route::post('files/{purpose}',[FileController::class, 'set']);
    Route::get('files',[FileController::class, 'getAllByPlace']);
    Route::get('files_find',[FileController::class, 'findByPurpose']);
    Route::delete('files/{id}',[FileController::class, 'delete']);

    Route::post('custom_booking_lengths',[CustomBookingLengthController::class, 'create']);
    Route::get('custom_booking_lengths/{id}',[CustomBookingLengthController::class, 'getId']);
    Route::post('custom_booking_lengths/{id}',[CustomBookingLengthController::class, 'save']);
    Route::delete('custom_booking_lengths/{id}',[CustomBookingLengthController::class, 'delete']);

    Route::get('billing/get_payment_link',[BillingController::class, 'getInvoiceByPrice']);
    Route::get('billing/get_help_payment_link',[BillingController::class, 'getHelpInvoiceByPrice']);
    Route::get('paid_messages/get_payment_link',[PaidMessageController::class, 'getInvoiceByPrice']);

    Route::get('video_guides',[VideoGuideController::class, 'getByLanguage']);
    Route::post('video_guides',[VideoGuideController::class, 'save']);
    Route::delete('video_guides/{id}',[VideoGuideController::class, 'delete']);

    Route::get('get_bulk_count',[MessageTemplateController::class, 'getBulkCount']);
    Route::post('send_bulk_sms',[MessageTemplateController::class, 'sendBulkSms']);

    Route::post('stop_booking',[TimetableController::class, 'stop_booking']);
    Route::post('unblock_booking',[TimetableController::class, 'unblock_booking']);
    Route::get('is_booking_stopped',[TimetableController::class, 'is_booking_stopped']);
});

Route::post('giftcards',[GiftcardController::class, 'create']);
Route::get('giftcards_check',[GiftcardController::class, 'getByCode']);
Route::post('giftcards_spend',[GiftcardController::class, 'spend']);

Route::get('places/{id}',[PlaceController::class, 'getId']);
Route::get('feedbacks_public',[FeedbackController::class, 'getAllPublic']);

Route::post('billing/webhook',[BillingController::class, 'webhook']);
Route::post('places/{place_id}/webhook',[OrderWebhookController::class, 'webhook']);
