<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CheckController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CustomBookingLengthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DishController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\GiftcardController;
use App\Http\Controllers\GiftcardMenuController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MessageTemplateController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderWebhookController;
use App\Http\Controllers\PaidMessageController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TableplanController;
use App\Http\Controllers\TerminalController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\VideoGuideController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

Route::get('free_dates',[OrderController::class, 'freeDates'])->middleware('bill_paid:booking');
Route::get('free_time',[OrderController::class, 'freeTime'])->middleware('bill_paid:booking');
Route::get('free_tables',[OrderController::class, 'freeTables'])->middleware('bill_paid:booking');
Route::get('work_dates',[OrderController::class, 'workDates'])->middleware('bill_paid:booking');
Route::get('work_time',[OrderController::class, 'workTime'])->middleware('bill_paid:booking');
Route::get('places/{place_id}/areas',[AreaController::class, 'getAllByPlace'])->middleware('bill_paid:booking');
Route::get('places/{place_id}/lengths',[CustomBookingLengthController::class, 'getAllByParams'])->middleware('bill_paid:booking');
Route::get('places/{place_id}/is_bill_paid',[PlaceController::class, 'isBillPaid']);
Route::get('places/{place_id}/bill_paid_status',[PlaceController::class, 'getBillPaidStatus']);
Route::get('places/{place_id}/message_limit',[PlaceController::class, 'getPaidMessages']);
Route::get('places/{place_id}/alternative',[PlaceController::class, 'getAlternative'])->middleware('bill_paid:booking');
Route::get('places/{place_id}/payment_method',[OrderController::class, 'getPlacePaymentMethod'])->middleware('bill_paid:booking');
Route::get('places/{place_id}/max_available_seats',[PlaceController::class, 'getMaxAvailableSeats'])->middleware('bill_paid:booking');
Route::get('places/{place_id}/online_booking_description',[OrderController::class, 'getPlaceOnlineBookingDescription'])->middleware('bill_paid:booking');
Route::get('places/{place_id}/online_booking_title',[OrderController::class, 'getPlaceOnlineBookingTitle'])->middleware('bill_paid:booking');
Route::post('places/{place_id}/send_contact',[PlaceController::class, 'sendContact']);

Route::get('files_purpose',[FileController::class, 'getByPurpose']);
Route::get('files_many_purposes',[FileController::class, 'getManyByPurpose']);
Route::get('countries',[CountryController::class, 'getAll']);

Route::get('custom_booking_lengths',[CustomBookingLengthController::class, 'getAllByParams'])->middleware('bill_paid:booking');
Route::get('giftcard_menus',[GiftcardMenuController::class, 'getAllByParams']);

Route::post('feedbacks',[FeedbackController::class, 'create'])->middleware('bill_paid:booking');
Route::post('feedbacks/is_exist',[FeedbackController::class, 'isFeedbackExist'])->middleware('bill_paid:booking');
Route::post('send_admin_contact',[PlaceController::class, 'sendtoAdmin']);

Route::get('settings',[SettingController::class, 'get']);
Route::get('settings/many',[SettingController::class, 'getMany']);

Route::delete('cancel_order/{id}',[OrderController::class, 'cancel']);

Route::middleware(['optional_auth:customer_api'])->group(function() {
    Route::post('make_order',[OrderController::class, 'makeOrder'])->middleware('bill_paid:booking');
});

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
    Route::post('settings/many',[SettingController::class, 'saveMany']);

    Route::post('places',[PlaceController::class, 'create']);
    Route::get('places/mine',[PlaceController::class, 'getAllMine']);
    Route::post('places/send_support',[PlaceController::class, 'sendSupport']);
    Route::post('places/{id}',[PlaceController::class, 'save']);
    Route::get('places/{place_id}/menus',[MenuController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/tableplans',[TableplanController::class, 'getAllByPlace'])->middleware('bill_paid:booking');
    Route::get('places/{place_id}/timetables',[TimetableController::class, 'getAllByPlace'])->middleware('bill_paid:booking');
    Route::get('places/{place_id}/custom_booking_lengths',[CustomBookingLengthController::class, 'getAllByPlace'])->middleware('bill_paid:booking');
    Route::get('places/{place_id}/customers',[PlaceController::class, 'getCustomers'])->middleware('bill_paid:booking');
    Route::get('places/{place_id}/users',[PlaceController::class, 'getUsers']);
    Route::get('places/{place_id}/is_trial_paid',[PlaceController::class, 'isTrialBillPaid']);
    Route::post('places/{place_id}/pay_trial',[BillingController::class, 'payTrial']);
    Route::get('places/{place_id}/get_last_active_trial',[BillingController::class, 'getLastActiveTrial']);
    Route::delete('billings/{id}',[BillingController::class, 'delete']);
    Route::get('places/{place_id}/billings',[BillingController::class, 'getAllByPlace']);
    Route::get('places/{place_id}/active_billings',[BillingController::class, 'getActiveByPlace']);
    Route::post('places/{place_id}/pay_messages_trial',[PaidMessageController::class, 'payTrial']);
    Route::get('places/{place_id}/paid_messages',[PaidMessageController::class, 'getAllByPlace']);
    Route::delete('places/{id}',[PlaceController::class, 'delete']);

    Route::get('check_customer',[CustomerController::class, 'getByEmail']);

    Route::post('roles',[RoleController::class, 'create']);
    Route::get('roles',[RoleController::class, 'getAll']);

    Route::post('tableplans',[TableplanController::class, 'create'])->middleware('bill_paid:booking');
    Route::get('tableplans/{id}',[TableplanController::class, 'getId']);
    Route::post('tableplans/{id}',[TableplanController::class, 'save']);
    Route::delete('tableplans/{id}',[TableplanController::class, 'delete']);

    Route::post('areas',[AreaController::class, 'create'])->middleware('bill_paid:booking');
    Route::get('areas/{id}',[AreaController::class, 'getId']);
    Route::post('areas/{id}',[AreaController::class, 'save']);
    Route::get('areas/{area_id}/working',[TimetableController::class, 'getWorkingByAreaAndDate']);
    Route::delete('areas/{id}',[AreaController::class, 'delete']);

    Route::post('timetables',[TimetableController::class, 'create'])->middleware('bill_paid:booking');
    Route::get('timetables/{id}',[TimetableController::class, 'getId']);
    Route::post('timetables/{id}',[TimetableController::class, 'save']);
    Route::delete('timetables/{id}',[TimetableController::class, 'delete']);

    Route::post('orders',[OrderController::class, 'create'])->middleware('bill_paid:booking');
    Route::get('orders/{id}',[OrderController::class, 'getId'])->where('id', '[0-9]+');
    Route::post('orders/{id}',[OrderController::class, 'save'])->where('id', '[0-9]+');
    Route::get('orders',[OrderController::class, 'getAllByParams']);
    Route::delete('orders/{id}',[OrderController::class, 'delete'])->where('id', '[0-9]+');
    Route::post('orders/{id}/restore',[OrderController::class, 'restore'])->where('id', '[0-9]+');
    Route::post('orders/{id}/status',[OrderController::class, 'setStatus'])->where('id', '[0-9]+');
    Route::post('orders_switch_tables',[OrderController::class, 'switchTables']);
    Route::get('orders/{id}/neighbors',[OrderController::class, 'neighbors'])->where('id', '[0-9]+');
    Route::post('pos_orders/',[OrderController::class, 'pos_create'])->middleware('bill_paid:pos,pos_terminal');

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

    Route::get('giftcards/{giftcard_id}',[GiftcardController::class, 'getId'])->middleware('bill_paid:giftcards');
    Route::post('giftcards/{giftcard_id}',[GiftcardController::class, 'save'])->middleware('bill_paid:giftcards');
    Route::delete('giftcards/{giftcard_id}',[GiftcardController::class, 'delete'])->middleware('bill_paid:giftcards');
    Route::get('giftcards',[GiftcardController::class, 'getAllByPlace'])->middleware('bill_paid:giftcards');
    Route::post('giftcards_admin',[GiftcardController::class, 'createAdmin'])->middleware('bill_paid:giftcards');

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
    Route::post('files_many/{purpose}',[FileController::class, 'setMany']);
    Route::get('files',[FileController::class, 'getAllByPlace']);
    Route::get('files_find',[FileController::class, 'findByPurpose']);
    Route::delete('files/{id}',[FileController::class, 'delete']);

    Route::post('custom_booking_lengths',[CustomBookingLengthController::class, 'create'])->middleware('bill_paid:booking');
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

    Route::post('stop_booking',[TimetableController::class, 'stop_booking'])->middleware('bill_paid:booking');
    Route::post('unblock_booking',[TimetableController::class, 'unblock_booking'])->middleware('bill_paid:booking');
    Route::get('is_booking_stopped',[TimetableController::class, 'is_booking_stopped'])->middleware('bill_paid:booking');

    Route::post('customers/{id}/black_list',[CustomerController::class, 'addBlackList'])->middleware('bill_paid:booking');
    Route::delete('customers/{id}/black_list',[CustomerController::class, 'removeBlackList'])->middleware('bill_paid:booking');

    Route::post('giftcard_menus',[GiftcardMenuController::class, 'create'])->middleware('bill_paid:giftcards');
    Route::post('giftcard_menus/{id}',[GiftcardMenuController::class, 'save'])->middleware('bill_paid:giftcards');
    Route::get('giftcard_menus/{id}',[GiftcardMenuController::class, 'getId']);
    Route::get('places/{place_id}/giftcard_menus',[GiftcardMenuController::class, 'getAllByPlace']);
    Route::delete('giftcard_menus/{id}',[GiftcardMenuController::class, 'delete']);

    Route::post('product_categories',[ProductCategoryController::class, 'create']);
    Route::post('product_categories/{id}',[ProductCategoryController::class, 'save'])->where('id', '[0-9]+');
    Route::delete('product_categories/{id}',[ProductCategoryController::class, 'delete'])->where('id', '[0-9]+');
    Route::get('places/{place_id}/product_categories',[ProductCategoryController::class, 'getAllByPlace']);
    Route::post('product_categories/set_position',[ProductCategoryController::class, 'setPosition']);

    Route::post('products',[ProductController::class, 'create'])->middleware('bill_paid:pos,pos_terminal');
    Route::post('products/{id}',[ProductController::class, 'save'])->middleware('bill_paid:pos,pos_terminal');
    Route::delete('products/{id}',[ProductController::class, 'delete']);
    Route::get('places/{place_id}/products',[ProductController::class, 'getAllByPlace'])->middleware('bill_paid:pos,pos_terminal');
    Route::post('product_categories/{id}/products/set_position',[ProductController::class, 'setPosition']);

    Route::get('orders/{order_id}/checks',[CheckController::class, 'getAllByOrder'])->middleware('bill_paid:pos,pos_terminal');
    Route::post('checks',[CheckController::class, 'create'])->middleware('bill_paid:pos,pos_terminal');
    Route::post('checks/{id}',[CheckController::class, 'save'])->middleware('bill_paid:pos,pos_terminal');
    Route::post('checks/{id}/refund',[CheckController::class, 'refund']);
    Route::post('checks/{id}/print',[CheckController::class, 'print']);
    Route::post('checks/{id}/send',[CheckController::class, 'send']);
    Route::post('checks/{id}/proforma',[CheckController::class, 'createProforma']);
    Route::post('checks/{id}/print_products',[CheckController::class, 'printProducts']);
    Route::post('checks/{id}/update_bank_log',[CheckController::class, 'updateBankLog']);
    Route::post('checks/{data}/print_template',[CheckController::class, 'printTemplate']);
    Route::delete('checks/{id}',[CheckController::class, 'delete']);

    Route::get('receipts',[CheckController::class, 'getAllReceipts'])->middleware('bill_paid:pos,pos_terminal');
    Route::get('receipts/{id}',[CheckController::class, 'getReceipt'])->where('id', '[0-9]+');
    Route::get('receipts/export_csv',[CheckController::class, 'exportCSV'])->middleware('bill_paid:pos,pos_terminal');
    Route::get('receipts/export_pdf',[CheckController::class, 'exportPDF'])->middleware('bill_paid:pos,pos_terminal');
    Route::get('receipts_report', [CheckController::class, 'getReceiptsReport'])->middleware('bill_paid:pos,pos_terminal');
    Route::get('receipts_category_report', [CheckController::class, 'getReceiptsCategoryReport'])->middleware('bill_paid:pos,pos_terminal');

    Route::get('has_key', [SettingController::class, 'hasKey']);
    Route::post('save_key',[SettingController::class, 'saveKey']);

    Route::get('places/{place_id}/terminals',[TerminalController::class, 'getAllByPlace'])->middleware('bill_paid:pos_terminal');
    Route::post('terminals',[TerminalController::class, 'create'])->middleware('bill_paid:pos_terminal');
    Route::post('terminals/{id}',[TerminalController::class, 'save'])->middleware('bill_paid:pos_terminal');
    Route::delete('terminals/{id}',[TerminalController::class, 'delete']);
    Route::post('terminals/{id}/pay',[TerminalController::class, 'sendPayment']);
    Route::post('terminals/{id}/revert',[TerminalController::class, 'sendRevert']);
    Route::post('terminals/{id}/abort',[TerminalController::class, 'sendAbort']);
    Route::post('terminals/{id}/input',[TerminalController::class, 'sendInput']);
    Route::post('terminals/{id}/refund',[TerminalController::class, 'sendRefund']);
    Route::post('websocket/from_client',[TerminalController::class, 'sendFromClient']);


    Route::get('customers/all',[CustomerController::class, 'allCustomers'])->middleware('bill_paid:booking');
});

Route::post('giftcards',[GiftcardController::class, 'create'])->middleware('bill_paid:giftcards');
Route::get('giftcards_check',[GiftcardController::class, 'getByCode'])->middleware('bill_paid:giftcards');
Route::post('giftcards_spend',[GiftcardController::class, 'spend']);
Route::post('giftcard_pdf_preview',[GiftcardController::class, 'pdfPreview'])->middleware('bill_paid:giftcards');

Route::get('places/{id}',[PlaceController::class, 'getId']);
Route::get('feedbacks_public',[FeedbackController::class, 'getAllPublic'])->middleware('bill_paid:booking');

Route::post('billing/webhook',[BillingController::class, 'webhook']);
Route::post('places/{place_id}/webhook',[OrderWebhookController::class, 'webhook'])->middleware('bill_paid:booking');

Route::get('receipts/saft',[CheckController::class, 'generateSaftReport']);
