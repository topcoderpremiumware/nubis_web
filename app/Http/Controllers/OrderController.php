<?php

namespace App\Http\Controllers;

use App\Events\OrderCreated;
use App\Events\OrderDeleted;
use App\Events\OrderRestored;
use App\Events\OrderUpdated;
use App\Helpers\TemplateHelper;
use App\Models\BlackList;
use App\Models\Customer;
use App\Models\Giftcard;
use App\Models\Log;
use App\Models\MessageTemplate;
use App\Models\Order;
use App\Models\Place;
use App\Models\Setting;
use App\Models\Tableplan;
use App\SMS\SMS;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Stripe\StripeClient;
use Illuminate\Support\Facades\Log as SysLog;

class OrderController extends Controller
{
    public function create(Request $request): JsonResponse
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
//            'customer_id' => 'exists:customers,id',
            'place_id' => 'required|exists:places,id',
            'tableplan_id' => 'required|exists:tableplans,id',
            'area_id' => 'required|exists:areas,id',
            'table_ids' => 'required|array',
            'seats' => 'required|integer',
            'reservation_time' => 'required|date_format:Y-m-d H:i:s',
            'length' => 'required|integer',
            'status' => 'required',
            'is_take_away' => 'required|boolean',
            'source' => 'required|in:online,internal'
        ]);

        $place = Place::find($request->place_id);
        if(!$place->is_bill_paid()) return response()->json([
            'message' => 'Your place\'s bill has not been paid'
        ], 401);

        $order = Order::create([
            'customer_id' => $request->customer_id,
            'place_id' => $request->place_id,
            'tableplan_id' => $request->tableplan_id,
            'area_id' => $request->area_id,
            'table_ids' => $request->table_ids,
            'seats' => $request->seats,
            'reservation_time' => $request->reservation_time,
            'length' => $request->length,
            'comment' => $request->comment ?? '',
            'status' => $request->status,
            'is_take_away' => $request->is_take_away,
            'source' => $request->source,
            'marks' => ['timezone_offset' => $request->timezone_offset],
            'custom_booking_length_id' => $request->custom_booking_length_id,
            'user_id' => Auth::user()->id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone
        ]);

        Log::add($request,'create-order','Created order #'.$order->id);

        if($request->customer_id) {
            $customer = Customer::find($request->customer_id);
            $customer_language = $customer->language;
            $customer_phone = $customer->phone;
            $customer_email = $customer->email;
        }else {
            $customer_language = $place->language;
            $customer_phone = $order->phone;
            $customer_email = $order->email;
        }
        $sms_confirmation_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','sms-confirmation')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();

        if($sms_confirmation_template && $place->allow_send_sms() && $customer_phone){
            $place->decrease_sms_limit();
            $result = SMS::send([$customer_phone], TemplateHelper::setVariables($order,$sms_confirmation_template->text,$customer_language), env('APP_SHORT_NAME'));
        }
        $email_confirmation_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','email-confirmation')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();
        if($email_confirmation_template && $customer_email){
            try{
                \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_confirmation_template->text,$customer_language), function($msg) use ($place,$email_confirmation_template, $customer_email) {
                    $msg->to($customer_email)->subject($email_confirmation_template->subject);
                    $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                });
            }catch (\Exception $e){}
        }
        event(new OrderCreated($order));
        return response()->json($order);
    }

    public function save($id, Request $request): JsonResponse
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
//            'customer_id' => 'exists:customers,id',
            'place_id' => 'required|exists:places,id',
            'tableplan_id' => 'required|exists:tableplans,id',
            'area_id' => 'required|exists:areas,id',
            'table_ids' => 'required|array',
            'seats' => 'required|integer',
            'reservation_time' => 'required|date_format:Y-m-d H:i:s',
            'length' => 'required|integer',
            'status' => 'required',
            'is_take_away' => 'required|boolean',
            'source' => 'required|in:online,internal'
        ]);

        $order = Order::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        if($order->status != 'no_show' && $request->status == 'no_show'){
            $this->paymentAfterOrderCancel($order,'no_show');
        }

        $res = $order->update([
            'customer_id' => $request->customer_id,
            'place_id' => $request->place_id,
            'tableplan_id' => $request->tableplan_id,
            'area_id' => $request->area_id,
            'table_ids' => $request->table_ids,
            'seats' => $request->seats,
            'reservation_time' => $request->reservation_time,
            'length' => $request->length,
            'comment' => $request->comment ?? '',
            'status' => $request->status,
            'is_take_away' => $request->is_take_away,
            'source' => $request->source,
            'marks' => $request->marks ?? [],
            'custom_booking_length_id' => $request->custom_booking_length_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone
        ]);

        Log::add($request,'change-order','Changed order #'.$order->id);
        $place = Place::find($request->place_id);

        if($request->customer_id) {
            $customer = Customer::find($request->customer_id);
            $customer_language = $customer->language;
            $customer_phone = $customer->phone;
            $customer_email = $customer->email;
        }else {
            $customer_language = $place->language;
            $customer_phone = $order->phone;
            $customer_email = $order->email;
        }

        $sms_change_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','sms-change')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();

        if($sms_change_template && $place->allow_send_sms() && $customer_phone){
            $place->decrease_sms_limit();
            $result = SMS::send([$customer_phone], TemplateHelper::setVariables($order,$sms_change_template->text,$customer_language), env('APP_SHORT_NAME'));
        }
        $email_change_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','email-change')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();
        if($email_change_template && $customer_email){
            try{
                \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_change_template->text,$customer_language), function($msg) use ($place,$email_change_template, $customer_email) {
                    $msg->to($customer_email)->subject($email_change_template->subject);
                    $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                });
            }catch (\Exception $e){}
        }


        if($res){
            $order = Order::find($id);
            event(new OrderUpdated($order));
            return response()->json($order);
        }else{
            return response()->json(['message' => 'Order not updated'],400);
        }
    }

    public function getId($id, Request $request): JsonResponse
    {
        $order = Order::where('id',$id)->with(['customer', 'custom_booking_length'])->first();

        if(!Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($order);
    }

    public function getAllByParams(Request $request): JsonResponse
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required', //|exists:areas,id
            'reservation_from' => 'required|date_format:Y-m-d H:i:s',
            'reservation_to' => 'required|date_format:Y-m-d H:i:s',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $orders = Order::where('place_id',$request->place_id)->orderBy('reservation_time','ASC');
        if($request->area_id != 'all') {
            $orders = $orders->where('area_id', $request->area_id);
        }
        $orders = $orders->with(['customer', 'custom_booking_length', 'area', 'author'])
            ->whereBetween('reservation_time', [$request->reservation_from, $request->reservation_to]);
        if($request->has('deleted')){
            $orders = $orders->onlyTrashed();
        }
        $orders = $orders->get();

        return response()->json($orders);
    }

    public function getAllByCustomer(Request $request): JsonResponse
    {
        if(!Auth::user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $orders = Order::where('customer_id',Auth::user()->id)
            ->with('custom_booking_length')
            ->get();

        return response()->json($orders);
    }

    public function delete($id, Request $request): JsonResponse
    {
        $order = Order::find($id);

        if(!$order){
            return response()->json([
                'message' => 'Order is not exist'
            ], 400);
        }

        if(!Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'delete-order','Deleted order #'.$order->id);
        $place = $order->place;
        if($order->customer_id) {
            $customer = $order->customer;
            $customer_language = $customer->language;
            $customer_phone = $customer->phone;
            $customer_email = $customer->email;
        }else {
            $customer_language = $place->language;
            $customer_phone = $order->phone;
            $customer_email = $order->email;
        }

        $sms_delete_template = MessageTemplate::where('place_id',$order->place_id)
            ->where('purpose','sms-delete')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();


        if($sms_delete_template && $place->allow_send_sms() && $customer_phone){
            $place->decrease_sms_limit();
            $result = SMS::send([$customer_phone], TemplateHelper::setVariables($order,$sms_delete_template->text,$customer_language), env('APP_SHORT_NAME'));
        }
        $email_delete_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','email-delete')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();
        if($email_delete_template && $customer_email){
            try{
                \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_delete_template->text,$customer_language), function($msg) use ($place,$email_delete_template, $customer_email) {
                    $msg->to($customer_email)->subject($email_delete_template->subject);
                    $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                });
            }catch (\Exception $e){}
        }

        $this->paymentAfterOrderCancel($order,'delete');
        event(new OrderDeleted($order));
        $order->delete();

        return response()->json(['message' => 'Order is deleted']);
    }

    public function restore($id, Request $request): JsonResponse
    {
        $order = Order::withTrashed()->find($id);

        if(!$order){
            return response()->json([
                'message' => 'Order is not exist'
            ], 400);
        }

        if(!Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'restore-order','Restored order #'.$order->id);


        event(new OrderRestored($order));
        $order->restore();

        return response()->json(['message' => 'Order is restored']);
    }

    public function cancel($id, Request $request): JsonResponse
    {
        $order = Order::find($id);

        $request->validate([
            'email' => 'required'
        ]);

        if(!$order){
            return response()->json([
                'message' => 'Order is not exist'
            ], 400);
        }

        if($order->customer_id){
            $customer_email = $order->customer->email;
        }else{
            $customer_email = $order->email;
        }

        if($customer_email !== $request->email){
            return response()->json([
                'message' => 'It\'s not your order'
            ], 400);
        }
        $place = $order->place;
        if($order->customer_id) {
            $customer = $order->customer;
            $customer_language = $customer->language;
            $customer_phone = $customer->phone;
            $customer_email = $customer->email;
        }else {
            $customer_language = $place->language;
            $customer_phone = $order->phone;
            $customer_email = $order->email;
        }

        $sms_delete_template = MessageTemplate::where('place_id',$order->place_id)
            ->where('purpose','sms-delete')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();

        $smsApiToken = $place->setting('sms-api-token');
        if($sms_delete_template && $place->allow_send_sms() && $customer_phone){
            $place->decrease_sms_limit();
            $result = SMS::send([$customer_phone], TemplateHelper::setVariables($order,$sms_delete_template->text,$customer_language), env('APP_SHORT_NAME'));
        }
        $email_delete_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','email-delete')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();
        if($email_delete_template && $customer_email){
            try{
                \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_delete_template->text,$customer_language), function($msg) use ($place,$email_delete_template, $customer_email) {
                    $msg->to($customer_email)->subject($email_delete_template->subject);
                    $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                });
            }catch (\Exception $e){}
        }

        $this->paymentAfterOrderCancel($order,'cancel');
        event(new OrderDeleted($order));
        $order->delete();

        return response()->json(['message' => 'Order is canceled']);
    }

    private function paymentAfterOrderCancel($order,$status)
    {
        $place = $order->place;
        $stripe_secret = $place->setting('stripe-secret');
        if(!$stripe_secret) return;
        try{
            $stripe = new StripeClient($stripe_secret);
        }catch (\Exception $e){
            return;
        }

        try{
            if($order->marks && array_key_exists('method',$order->marks)){
                if($order->marks['method'] == 'deduct' && in_array($status,['delete','cancel'])){
                    if(array_key_exists('payment_intent_id',$order->marks)){
                        if(($status === 'cancel' && $place->country->timeNow()->diffInMinutes($order->reservation_time,false) > $order->marks['cancel_deadline']) || $status === 'delete'){
                            $stripe->refunds->create(['payment_intent' => $order->marks['payment_intent_id']]);
                            $order->refundGiftcard();
                        }
                    }
                }elseif($order->marks['method'] == 'reserve' && in_array($status,['delete','cancel'])){
                    if(array_key_exists('payment_intent_id',$order->marks)){
                        if(($status === 'cancel' && $place->country->timeNow()->diffInMinutes($order->reservation_time,false) > $order->marks['cancel_deadline']) || $status === 'delete'){
                            $payment_intent = $stripe->paymentIntents->retrieve($order->marks['payment_intent_id']);
                            if($payment_intent->status == 'succeeded'){
                                $stripe->refunds->create(['payment_intent' => $order->marks['payment_intent_id']]);
                                $order->refundGiftcard();
                            }else{
                                $stripe->paymentIntents->cancel($order->marks['payment_intent_id'],['cancellation_reason' => 'requested_by_customer']);
                            }
                        }
                    }
                }elseif($order->marks['method'] == 'no_show' && in_array($status,['delete','no_show','cancel'])){
                    if(array_key_exists('payment_method_id',$order->marks)){
                        if($status == 'cancel'){
                            if($place->country->timeNow()->diffInMinutes($order->reservation_time,false) < $order->marks['cancel_deadline']){
                                $stripe->paymentIntents->cancel($order->marks['payment_intent_id'],['cancellation_reason' => 'requested_by_customer']);
                            }
                        }
                        if($status == 'no_show'){
                            if($place->country->timeNow()->diffInMinutes($order->reservation_time,false) < $order->marks['cancel_deadline']){
                                $payment_intent = $stripe->paymentIntents->retrieve($order->marks['payment_intent_id']);
                                $payment_intent->capture();
                            }
                        }
                        if($status == 'delete'){
                            $stripe->paymentIntents->cancel($order->marks['payment_intent_id'],['cancellation_reason' => 'requested_by_customer']);
                        }
                    }
                }
            }
        }catch (\Exception $e){
            SysLog::error($e->getMessage());
        }
    }

    public function setStatus($id, Request $request): JsonResponse
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'status' => 'required',
        ]);

        $order = Order::find($id);

        if(!Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        self::setOrderStatus($order,$request->status);

        Log::add($request,'change-order-status','Changed order #'.$order->id.' status '.$request->status);

        return response()->json(['message' => 'Order status changed']);
    }

    public static function setOrderStatus($order,$status)
    {
        if($status == 'deleted'){
            (new OrderController)->paymentAfterOrderCancel($order,'delete');
            $order->delete();
        }else{
            $res = $order->update([
                'status' => $status,
            ]);
        }

        if($status == 'no_show' && $order->marks['method'] == 'no_show' && array_key_exists('payment_method_id',$order->marks)){
            $stripe_secret = $order->place->setting('stripe-secret');
            $stripe = new StripeClient($stripe_secret);
            $payment_intent = $stripe->paymentIntents->retrieve($order->marks['payment_intent_id']);
            $payment_intent->capture();
        }

        if($status == 'completed'){
            $place = $order->place;
            if($order->customer_id) {
                $customer = $order->customer;
                $customer_language = $customer->language;
                $customer_phone = $customer->phone;
                $customer_email = $customer->email;
            }else {
                $customer_language = $place->language;
                $customer_phone = $order->phone;
                $customer_email = $order->email;
            }
            if($place->allow_send_sms() && $customer_phone){
                $place->decrease_sms_limit();
                $result = SMS::send([$customer_phone], env('MIX_APP_URL').'/feedback/'.$order->id, env('APP_SHORT_NAME'));
            }
            $email_template = MessageTemplate::where('place_id',$order->place_id)
                ->where('purpose','email-feedback-request')
                ->where('language',$customer_language)
                ->where('active',1)
                ->first();
            if($email_template && $customer_email) {
                $place = Place::find($order->place_id);
                try{
                    \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_template->text,$customer_language), function ($msg) use ($place,$email_template, $customer_email) {
                        $msg->to($customer_email)->subject($email_template->subject);
                        $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                    });
                }catch (\Exception $e){}
            }
        }
    }

    public function freeDates(Request $request): JsonResponse
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d',
        ]);
        $place = Place::find($request->place_id);
        $period = CarbonPeriod::create($request->from, $request->to);
        $result = [];
        foreach ($period as $date) {
            if($date->lt($place->country->timeNow()->setTime(0,0,0))) continue;
            $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$date->format("Y-m-d"));
            if(empty($working_hours)) continue;
            $time_from = $date->copy();
            $time_from->setTime(0, 0, 0);
            $time_to = $date->copy();
            $time_to->setTime(23, 59, 59);
//            $orders = Order::where('place_id',$request->place_id)
//                ->where('area_id',$request->area_id)
//                ->whereBetween('reservation_time',[$time_from,$time_to])
//                ->where('is_take_away',0)
//                ->whereIn('status',['confirmed','arrived','pending'])
//                ->get();

            $free_time = self::getFreeTime($request->place_id,$request->area_id, $request->seats,$date,$working_hours);
            if(count($free_time) > 0){
                array_push($result,$date);
            }
        }
        return response()->json($result);
    }

    public static function getFreeTime($place_id, $area_id, $request_seats, $request_date, $working_hours): array
    {
        $time_from = $request_date->copy();
        $time_from->setTime(0, 0, 0);
        $time_to = $request_date->copy();
        $time_to->setTime(23, 59, 59);
        $orders = Order::where('place_id',$place_id)
            ->where('area_id',$area_id)
            ->whereBetween('reservation_time',[$time_from,$time_to])
            ->where('is_take_away',0)
            ->whereIn('status',['confirmed','arrived','pending'])
            ->get();
        $place = Place::find($place_id);
        $free_tables = (new OrderController())->getFreeTables($orders, $working_hours, $request_seats, false);

        $free_time = [];
        foreach($working_hours as $working_hour){
            $time = Carbon::parse($request_date->format('Y-m-d').' '.$working_hour['from']);
            $end = Carbon::parse($request_date->format('Y-m-d').' '.$working_hour['to']);
            for($time;$time->lt($end);$time->addMinutes(15)){
                if($time->lt($place->country->timeNow()->addMinutes($working_hour['min_time_before']))) continue;
                $indexFrom = intval($time->format('H'))*4 + floor(intval($time->format('i'))/15);
                if(array_key_exists($working_hour['tableplan_id'],$free_tables)) {

                    if(array_key_exists('booking_limits', $working_hour) && is_array($working_hour['booking_limits']) &&
                        array_key_exists($indexFrom, $working_hour['booking_limits'])){
                        $timeOrders_seats = 0;
                        $timeOrders = Order::where('place_id',$place_id)
                            ->where('area_id',$area_id)
                            ->where('reservation_time',$time->format('Y-m-d H:i:s'))
                            ->where('is_take_away',0)
                            ->whereIn('status',['confirmed','arrived','pending'])
                            ->get();
                        foreach ($timeOrders as $timeOrder) {
                            $timeOrders_seats += $timeOrder->seats;
                        }

                        $booking_limits = $working_hour['booking_limits'][$indexFrom];
                        $is_max_seats = $booking_limits['max_seats'] == 0 || $booking_limits['max_seats'] >= $timeOrders_seats+$request_seats;
                        $is_max_books = $booking_limits['max_books'] == 0 || $booking_limits['max_books'] >= count($timeOrders)+1;

                        if(!$is_max_seats || !$is_max_books) continue;
                    }

                    foreach ($free_tables[$working_hour['tableplan_id']] as $table) {
                        if(!array_key_exists('seats',$table)) continue;
                        if($table['seats'] < $request_seats) continue;
                        if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                            $reserv_to = $time->copy()->addMinutes($working_hour['length']);
                            $reserv_from = $time->copy();

                            for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                                $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
                                if(array_key_exists('ordered', $table['time'][$i])){
                                    continue 2;
                                }
                            }
                            array_push($free_time, $time->copy());
                            break;
                        }
                    }

                    $groups_table_seats = [];
                    $groups_tables = [];
                    foreach ($free_tables[$working_hour['tableplan_id']] as $table) {
                        if(!array_key_exists('grouped',$table)) continue;
                        if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                            $group_id = $table['time'][0]['group'];
                            $reserv_to = $time->copy()->addMinutes($working_hour['length']);
                            $reserv_from = $time->copy();

                            for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                                $i = intval($reserv_from->format('H')) * 4 + floor(intval($reserv_from->format('i')) / 15);
                                if (array_key_exists('ordered', $table['time'][$i])) {
                                    continue 2;
                                }
                            }

                            if(!array_key_exists($group_id, $groups_table_seats)){
                                $groups_tables[$group_id] = [];
                                $groups_table_seats[$group_id] = 0;
                            }
                            $groups_tables[$group_id][] = $table;
                            $groups_table_seats[$group_id] += $table['seats'];
                            if($groups_table_seats[$group_id] >= $request_seats) {
                                array_push($free_time, $time->copy());
                                break;
                            }
                        }
                    }
                }
            }
        }
        $free_time = array_values(array_unique($free_time));
        return $free_time;
    }

    public function workDates(Request $request): JsonResponse
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d',
        ]);
        $place = Place::find($request->place_id);
        $period = CarbonPeriod::create($request->from, $request->to);
        $result = [];
        foreach ($period as $date) {
            if($date->lt($place->country->timeNow()->setTime(0,0,0))) continue;
            $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$date->format("Y-m-d"));
            if(empty($working_hours)) continue;
            if($this->getFreeTables(collect([]), $working_hours, $request->seats)){
                array_push($result,$date);
            }
        }
        return response()->json($result);
    }

    public function freeTime(Request $request): JsonResponse
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'date' => 'required|date_format:Y-m-d',
        ]);
        $place = Place::find($request->place_id);
        $request_date = Carbon::parse($request->date);
        if($request_date->lt($place->country->timeNow()->setTime(0,0,0))) return response()->json([
            'message' => 'Date must be today and later'
        ], 400);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$request_date->format("Y-m-d"));
        if(empty($working_hours)) return response()->json([
            'message' => 'Non-working day'
        ], 400);

        $logs = [];

        $free_time = self::getFreeTime($request->place_id,$request->area_id, $request->seats,$request_date,$working_hours);
        return response()->json(['free_time' => $free_time,'logs' => $logs]);
    }

    public function workTime(Request $request): JsonResponse
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'date' => 'required|date_format:Y-m-d',
        ]);
        $place = Place::find($request->place_id);
        $request_date = Carbon::parse($request->date);
        if($request_date->lt($place->country->timeNow()->setTime(0,0,0))) return response()->json([
            'message' => 'Date must be today and later'
        ], 400);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$request_date->format("Y-m-d"),$request->has('admin'));
        if(empty($working_hours)) return response()->json([
            'message' => 'Non-working day'
        ], 400);

        $free_tables = $this->getFreeTables(collect([]), $working_hours, $request->seats, false,$request->has('admin'));
        $work_time = [];

        foreach($working_hours as $working_hour){
            $time = Carbon::parse($request->date.' '.$working_hour['from']);
            $end = Carbon::parse($request->date.' '.$working_hour['to']);
            for($time;$time->lt($end);$time->addMinutes(15)){
                $indexFrom = intval($time->format('H'))*4 + floor(intval($time->format('i'))/15);
                if(array_key_exists($working_hour['tableplan_id'],$free_tables)){
                    foreach ($free_tables[$working_hour['tableplan_id']] as $table){
                        if(!array_key_exists('ordered',$table['time'][$indexFrom])){
                            if(!$time->lt($place->country->timeNow()->addMinutes($working_hour['min_time_before']))){
                                array_push($work_time,$time->copy());
                                break;
                            }
                        }
                    }
                }
            }
        }
        return response()->json($work_time);
    }

    public function getFreeTables($orders,$working_hours,$seats,$boolean = true,$for_admin = false)
    {
        $free_tables = [];
        //Отримується список всіх столів, які фізично доступні для замовлення, тобто підходять за кількістю місць. Сюди ще додаються столи які можуть бути згруповані в групи, і при цьому підходять за кількістю місць.
        $orders_seats = array_reduce($orders->toArray(),function($sum,$order){
            return $sum + $order['seats'];
        });
        foreach ($working_hours as $working_hour){
            if(!$working_hour || !array_key_exists('tableplan_id',$working_hour) || !$working_hour['tableplan_id']) continue;
            $tableplan = Tableplan::find($working_hour['tableplan_id']);
            if(!$tableplan) continue;
            if($orders_seats >= $working_hour['max']) continue;
            $tables = $tableplan->getTables();
            foreach ($tables as $tab){
                if(!$for_admin && $tab['seats'] < $seats) continue;
                if(!$for_admin && $tab['time'][0]['is_online'] && $tab['time'][0]['min_seats'] > $seats) continue;
                if(!array_key_exists($tableplan->id,$free_tables) || !array_key_exists($tab['number'],$free_tables[$tableplan->id])){
                    $free_tables[$tableplan->id][$tab['number']] = $tab;
                }
            }
            $groups = $tableplan->getTableGroups();
            foreach ($groups as $group) {
                if(!$for_admin && $group['seats'] < $seats) continue;
                if(!$group['is_online']) continue;
                foreach ($group['tables'] as $tab) {
                    $free_tables[$tableplan->id][$tab['number']] = $tab;
                }
            }
        }
        foreach ($orders as $order){
            if(array_key_exists($order->tableplan_id,$free_tables)){
                $reservTo = $order->reservation_time->copy();
                $reservTo = $reservTo->addMinutes($order->length);
                $diff = $order->reservation_time->copy()->setTime(0,0,0)->diff($reservTo->copy()->setTime(0,0,0))->days; // get diff days if order finished next day
                $indexFrom = intval($order->reservation_time->format('H'))*4 + floor(intval($order->reservation_time->format('i'))/15);
                $indexTo = intval($reservTo->format('H'))*4 + floor(intval($reservTo->format('i'))/15) + $diff*96;
                foreach ($order->table_ids as $table_id){
                    // тут не можна писати, непройшовший перевірку, в логи, бо він тоді виходить без потрібних полів, а тільки з логами
//                    $free_tables[$order->tableplan_id][$table_id]['logs'][] = 'Початок циклу перевірки '.$order->reservation_time->format('Y-m-d H:i').' '.$order->length.' '.$reservTo->format('Y-m-d H:i');
                    if(array_key_exists($table_id,$free_tables[$order->tableplan_id])) {
                        $free_tables[$order->tableplan_id][$table_id]['logs'][] = 'Пройшов перевірку чи є стіл у вільних '.$indexFrom.' > '.$indexTo;
                        for($i = $indexFrom;$i<$indexTo;$i++){ // $i<$indexTo - allow to order in same time when prev order is finished
                            $free_tables[$order->tableplan_id][$table_id]['logs'][] = $i.' відмічений зайнятим';
                            $free_tables[$order->tableplan_id][$table_id]['time'][$i]['ordered'] = true;
                        }
                    }
                }
            }
        }
        if($boolean){
            $free_table = false;
            foreach ($free_tables as $tables){
                foreach ($tables as $table){
                    $free_time = [];
                    $index = 0;
                    $prev_status = '';
                    foreach ($table['time'] as $time){
                        $status = array_key_exists('ordered',$time);
                        if($prev_status && !$status){
                            $index++;
                        }
                        if(!$status) {
                            if(array_key_exists($index,$free_time)){
                                $free_time[$index] += 15;
                            }else{
                                $free_time[$index] = 15;
                            }
                        }
                        $prev_status = $status;
                    }
                    if(!empty($free_time) && max($free_time) >= 120){
                        $free_table = $table;
                        break 2;
                    }
                }
            }
            return $free_table;
        }

        return $free_tables;
    }

    public function makeOrder(Request $request): JsonResponse
    {
        $log = [];
        $prepayment_url = null;
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'reservation_time' => 'required|date_format:Y-m-d H:i:s',
            'is_take_away' => 'required|boolean',
        ]);

        $place = Place::find($request->place_id);
        $customer_deny_register = (bool)$place->setting('customer-deny-register');

        if(!$customer_deny_register){
            $black_list = BlackList::where('customer_id',Auth::user()->id)
                ->where('place_id',$request->place_id)
                ->count();

            if($black_list > 0) abort(403, 'The customer is on the blacklist of this place.');
        }

        $reservation_time = Carbon::parse($request->reservation_time);
        if($reservation_time->lt($place->country->timeNow())) return response()->json([
            'message' => 'Time must be in the future'
        ], 400);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$reservation_time->format("Y-m-d"));
        if(empty($working_hours)) return response()->json([
            'message' => 'Non-working day'
        ], 400);

        if(!$place->is_bill_paid()) return response()->json([
            'message' => 'Your place\'s bill has not been paid'
        ], 401);

        if(!$customer_deny_register) {
            $last_order = Order::where('customer_id', Auth::user()->id)
                ->where('place_id', $request->place_id)
                ->where('area_id', $request->area_id)
                ->where('reservation_time', $request->reservation_time)
                ->where('created_at', '>', Carbon::now()->addMinutes(-2))
                ->first();
        }else{
            $last_order = Order::where('email', $request->email)
                ->where('place_id', $request->place_id)
                ->where('area_id', $request->area_id)
                ->where('reservation_time', $request->reservation_time)
                ->where('created_at', '>', Carbon::now()->addMinutes(-2))
                ->first();
        }
        if ($last_order) return response()->json([
            'message' => 'Too many orders in a short time'
        ], 400);


        $tableplan_id = null;
        $table_ids = [];
        $length = 120;
        if($request->has('length') && intval($request->length) > 0){
            $length = intval($request->length);
        }

        $log['length'] = $length;

        $status = ($request->has('status') && $request->status === 'waiting') ? 'waiting' : 'confirmed';

        if(!$request->is_take_away && $status === 'confirmed'){
            $time_from = $reservation_time->copy();
            $time_from->setTime(0, 0, 0);
            $time_to = $reservation_time->copy();
            $time_to->setTime(23, 59, 59);
            $orders = Order::where('place_id',$request->place_id)
                ->where('area_id',$request->area_id)
                ->whereBetween('reservation_time',[$time_from,$time_to])
                ->where('is_take_away',0)
                ->whereIn('status',['confirmed','arrived','pending'])
                ->get();

            $free_tables = $this->getFreeTables($orders, $working_hours, $request->seats, false);

            $log['all_free_tables'] = $free_tables;
            $log['ordered_tables'] = [];
            $log['ordered_groups'] = [];

            $indexFrom = intval($reservation_time->format('H'))*4 + floor(intval($reservation_time->format('i'))/15);
            foreach ($free_tables as $plan_id => $tables){
                foreach ($tables as $table) {
                    if($table['seats'] < $request->seats) continue;
                    if($table['time'][0]['min_seats'] > 0 && $table['time'][0]['min_seats'] > $request->seats) continue;
                    if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                        $reserv_to = $reservation_time->copy()->addMinutes($length);
                        $reserv_from = $reservation_time->copy();

                        for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                            $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
                            if(array_key_exists('ordered', $table['time'][$i])){
                                $log['ordered_tables'][] = $table['number'];
                                continue 2;
                            }
                        }
                        $log['table_selected_for_order'] = $table['number'];
                        $table_ids = [$table['number']];
                        $tableplan_id = $plan_id;
                        break 2;
                    }
                }

                $groups_table_ids = [];
                $groups_table_seats = [];
                foreach ($tables as $table) {
                    if(!array_key_exists('grouped',$table)) continue;
                    if(array_key_exists('ordered', $table['time'][$indexFrom])) continue;
                    $reserv_to = $reservation_time->copy()->addMinutes($length);
                    $reserv_from = $reservation_time->copy();

                    for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                        $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
                        if(array_key_exists('ordered', $table['time'][$i])){
                            $log['ordered_groups'][] = $table['number'];
                            continue 2;
                        }
                    }
                    $group_id = $table['time'][0]['group'];
                    $groups_table_ids[$group_id][] = $table['number'];
                    if(!array_key_exists($group_id, $groups_table_seats)) $groups_table_seats[$group_id] = 0;
                    $groups_table_seats[$group_id] += $table['seats'];
                    if($groups_table_seats[$group_id] >= $request->seats){
                        $log['group_selected_for_order'] = $groups_table_ids[$group_id];
                        $table_ids = $groups_table_ids[$group_id];
                        $tableplan_id = $plan_id;
                        break 2;
                    }
                }
            }
        }else{
            $tableplan_id = $working_hours[0]['tableplan_id'];
            $table_ids = [1];
            $length = 120;
        }

        if(empty($table_ids)){
            return response()->json([
                'message' => 'There are no free tables for the required time',
                'log' => $log
            ], 400);
        }

        $order = Order::create([
            'customer_id' => $customer_deny_register ? null : Auth::user()->id,
            'place_id' => $request->place_id,
            'tableplan_id' => $tableplan_id,
            'area_id' => $request->area_id,
            'table_ids' => $table_ids,
            'seats' => $request->seats,
            'reservation_time' => $request->reservation_time,
            'length' => $length,
            'comment' => $request->comment ?? '',
            'status' => $status,
            'is_take_away' => $request->is_take_away,
            'source' => 'online',
            'marks' => ['timezone_offset' => $request->timezone_offset],
            'custom_booking_length_id' => $request->custom_booking_length_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone
        ]);

        if(intval($place->setting('is-online-payment')) === 1) {
            if ($place->setting('online-payment-method') === 'deduct') {
                $currency = $place->setting('online-payment-currency');
                $amount = $place->setting('online-payment-amount');
                $prepayment_url = $this->getPrepaymentUrl($request, $order);
                if ($prepayment_url) {
                    $order->status = 'pending';
                    $order->marks = array_merge($order->marks,[
                        'method' => 'deduct',
                        'amount' => self::getAmountAfterDiscount($amount * $request->seats,$request->giftcard_code,$currency,$request->place_id),
                        'amountWithoutDiscount' => $amount * $request->seats,
                        'giftcard_code' => $request->giftcard_code,
                        'currency' => $currency,
                        'cancel_deadline' => $place->setting('online-payment-cancel-deadline')
                    ]);
                    $order->timestamps = false;
                    $order->save();
                }
            } else {
                if(!$request->has('setup_intent_id')){
                    return response()->json([
                        'message' => 'There are no setup_intent_id'
                    ], 400);
                }
                $marks = $this->processPaymentAlgorithm($request, $order);
                if ($marks) {
                    if(array_key_exists('error',$marks)){
                        $error = $marks['error'];
                        unset($marks['error']);
                        $order->marks = array_merge($order->marks,$marks);
                        $order->timestamps = false;
                        $order->save();
                        return response()->json(array_merge($error,['order' => $order]), 402);
                    }
                    $order->marks = array_merge($order->marks,$marks);
                    $order->timestamps = false;
                    $order->save();
                }
                self::sendNewOrderNotification($order,$place);
            }
        }else{
            self::sendNewOrderNotification($order,$place);
        }

        $order->prepayment_url = $prepayment_url;
        event(new OrderCreated($order));
        return response()->json($order);
    }

    private function getPrepaymentUrl($request,$order): JsonResponse|string
    {
        $url = '';
        $place = Place::find($request->place_id);

        $online_payment_amount = $place->setting('online-payment-amount') * $order->seats;
        $online_payment_currency = $place->setting('online-payment-currency');
        $stripe_secret = $place->setting('stripe-secret');
        $stripe_webhook_secret = $place->setting('stripe-webhook-secret');

        if(empty($online_payment_amount) || $online_payment_amount <= 0){
            return response()->json([
                'message' => 'Payment amount settings is not set'
            ], 400);
        }
        if(empty($online_payment_currency)){
            return response()->json([
                'message' => 'Payment currency settings is not set'
            ], 400);
        }
        if(empty($stripe_secret) || empty($stripe_webhook_secret)){
            return response()->json([
                'message' => 'Stripe settings is not set'
            ], 400);
        }

        if($stripe_secret && $stripe_webhook_secret && $online_payment_currency){
            $stripe = new StripeClient($stripe_secret);
            $price = $stripe->prices->create([
                'unit_amount' => self::getAmountAfterDiscount($online_payment_amount,$request->giftcard_code,$online_payment_currency,$request->place_id) * 100,
                'currency' => $online_payment_currency,
                'product_data' => [
                    'name' => $place->name.', '.$order->seats.' seats prepayment'
                ]
            ]);

            $link = $stripe->paymentLinks->create(
                [
                    'line_items' => [['price' => $price->id, 'quantity' => 1]],
                    'metadata' => [
                        'order_id' => $order->id
                    ],
                    'after_completion' => [
                        'type' => 'redirect',
                        'redirect' => ['url' => env('APP_URL').'/thank-you/order/'.$order->id],
                    ],
                ]
            );

            $url = $link->url;
        }

        return $url;
    }

    private function processPaymentAlgorithm($request,$order): array
    {
        $place = Place::find($request->place_id);
        $method = $place->setting('online-payment-method');
        $amount = $place->setting('online-payment-amount') * $request->seats;
        $currency = $place->setting('online-payment-currency');
        $cancel_deadline = $place->setting('online-payment-cancel-deadline');
        $marks = [
            'method' => $method,
            'amount' => self::getAmountAfterDiscount($amount,$request->giftcard_code,$currency,$request->place_id),
            'amountWithoutDiscount' => $amount,
            'giftcard_code' => $request->giftcard_code,
            'currency' => $currency,
            'cancel_deadline' => $cancel_deadline
        ];
        $stripe_secret = $place->setting('stripe-secret');
        $stripe = new StripeClient($stripe_secret);

        if($method === 'reserve'){ // 2) Перший метод вже є для другого треба блокувати гроші
            $order->status = 'pending';
            $order->timestamps = false;
            $order->save();
            if($place->country->timeNow()->diff($request->reservation_time)->days > 6){
                // Якщо замовлення раніше ніж 6 днів тоді запланувати відсилання через крон посилання на оплату як в першому методі
                $marks['need_send_payment_link'] = true;
            }else{
                // Якщо замовлення пізніже ніж 6 днів тоді створити payment_intent manual, а потім його capture через крон
                $setup_intent = $stripe->setupIntents->retrieve($request->setup_intent_id);
                try {
                    $payment_intent = $stripe->paymentIntents->create([
                        'amount' => self::getAmountAfterDiscount($amount,$request->giftcard_code,$currency,$request->place_id) * 100,
                        'currency' => $currency,
                        'confirm' => true,
                        'off_session' => true,
                        'payment_method' => $setup_intent->payment_method,
                        'customer' => $setup_intent->customer,
                        'capture_method' => 'manual',
                        'metadata' => [
                            'order_id' => $order->id
                        ],
                    ]);
                } catch (\Stripe\Exception\CardException $e) {
                    $payment_intent_id = $e->getError()->payment_intent->id;
                    $payment_intent = $stripe->paymentIntents->retrieve($payment_intent_id);
                    $marks['error'] = [
                        'message' => $e->getError()->code,
                        'payment_intent' => $payment_intent
                    ];
                }
                $marks['customer_id'] = $setup_intent->customer;
                $marks['payment_method_id'] = $setup_intent->payment_method;
                $marks['payment_intent_id'] = $payment_intent->id;
                $marks['need_capture'] = true;
            }
        }elseif($method === 'no_show'){ // 3) для третього методу треба створити card_token і його ід записати в marks
            $setup_intent = $stripe->setupIntents->retrieve($request->setup_intent_id);
            try {
                $payment_intent = $stripe->paymentIntents->create([
                    'amount' => self::getAmountAfterDiscount($amount,$request->giftcard_code,$currency,$request->place_id) * 100,
                    'currency' => $currency,
                    'confirm' => true,
                    'off_session' => true,
                    'payment_method' => $setup_intent->payment_method,
                    'customer' => $setup_intent->customer,
                    'capture_method' => 'manual'
                ]);
            } catch (\Stripe\Exception\CardException $e) {
                $payment_intent_id = $e->getError()->payment_intent->id;
                $payment_intent = $stripe->paymentIntents->retrieve($payment_intent_id);
                $marks['error'] = [
                    'message' => $e->getError()->code,
                    'payment_intent' => $payment_intent
                ];
            }
            $marks['customer_id'] = $setup_intent->customer;
            $marks['payment_method_id'] = $setup_intent->payment_method;
            $marks['payment_intent_id'] = $payment_intent->id;
        }

        return $marks;
    }

    public static function sendNewOrderNotification($order,$place)
    {
        if($order->customer_id) {
            $customer = $order->customer;
            $customer_language = $customer->language;
            $customer_phone = $customer->phone;
            $customer_email = $customer->email;
        }else {
            $customer_language = $place->language;
            $customer_phone = $order->phone;
            $customer_email = $order->email;
        }
        $sms_confirmation_template = MessageTemplate::where('place_id',$order->place_id)
            ->where('purpose','sms-confirmation')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();

        if($sms_confirmation_template && $place->allow_send_sms() && $customer_phone){
            $place->decrease_sms_limit();
            $result = SMS::send([$customer_phone], TemplateHelper::setVariables($order,$sms_confirmation_template->text,$customer_language), env('APP_SHORT_NAME'));
        }
        $email_confirmation_template = MessageTemplate::where('place_id',$order->place_id)
            ->where('purpose','email-confirmation')
            ->where('language',$customer_language)
            ->where('active',1)
            ->first();
        if($email_confirmation_template && $customer_email){
            try{
                \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_confirmation_template->text,$customer_language), function($msg) use ($place,$customer_email, $email_confirmation_template) {
                    $msg->to($customer_email)->subject($email_confirmation_template->subject);
                    $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                });
            }catch (\Exception $e){}
        }

        $sms_notification_template = MessageTemplate::where('place_id',$order->place_id)
            ->where('purpose','sms-notification')
            ->where('language',$place->language)
            ->where('active',1)
            ->first();
        if($sms_notification_template){
            if($place->setting('sms-notification-number')){
                $sms_notification_numbers = explode(',',$place->setting('sms-notification-number'));
            }else{
                $sms_notification_numbers = [$place->phone];
            }
            foreach ($sms_notification_numbers as $number) {
                if($place->allow_send_sms()){
                    $place->decrease_sms_limit();
                    $result = SMS::send([$number], TemplateHelper::setVariables($order, $sms_notification_template->text,$place->language), env('APP_SHORT_NAME'));
                }
            }
        }
    }

    public function freeTables(Request $request): JsonResponse
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'reservation_time' => 'required|date_format:Y-m-d H:i:s',
            'length' => 'required|integer'
        ]);

        $reservation_time = Carbon::parse($request->reservation_time);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$reservation_time->format("Y-m-d"),$request->has('admin'));
        if(empty($working_hours)) return response()->json([
            'message' => 'Non-working day'
        ], 400);

        $time_from = $reservation_time->copy();
        $time_from->setTime(0, 0, 0);
        $time_to = $reservation_time->copy();
        $time_to->setTime(23, 59, 59);
        $orders = Order::where('place_id',$request->place_id)
            ->where('area_id',$request->area_id)
            ->whereBetween('reservation_time',[$time_from,$time_to])
            ->where('is_take_away',0)
            ->whereIn('status',['confirmed','arrived','pending'])
            ->get();

        $free_tables = $this->getFreeTables($orders, $working_hours, $request->seats, false,true);

        $result = [];

        $indexFrom = intval($reservation_time->format('H'))*4 + floor(intval($reservation_time->format('i'))/15);
        foreach ($free_tables as $plan_id => $tables){
            foreach ($tables as $table) {
//                if($table['seats'] < $request->seats) continue;
                if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                    $reserv_to = $reservation_time->copy()->addMinutes($request->length);
                    $reserv_from = $reservation_time->copy();

                    for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                        $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
                        if(array_key_exists('ordered', $table['time'][$i])){
                            continue 2;
                        }
                    }
                    $result[$plan_id][] = $table;
                }
            }

//            $groups_tables = [];
//            $groups_table_seats = [];
//            foreach ($tables as $table) {
//                if(!array_key_exists('grouped',$table)) continue;
//                if(array_key_exists('ordered', $table['time'][$indexFrom])) continue;
//                $reserv_to = $reservation_time->copy()->addMinutes($request->length);
//                $reserv_from = $reservation_time->copy();
//
//                for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
//                    $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
//                    if(array_key_exists('ordered', $table['time'][$i])){
//                        continue 2;
//                    }
//                }
//                $group_id = $table['time'][0]['group'];
//                $groups_tables[$group_id][] = $table;
//                if(!array_key_exists($group_id, $groups_table_seats)) $groups_table_seats[$group_id] = 0;
//                $groups_table_seats[$group_id] += $table['seats'];
//                if($groups_table_seats[$group_id] >= $request->seats){
//                    if(!array_key_exists($plan_id,$result) || !is_array($result[$plan_id])) $result[$plan_id] = [];
//                    $result[$plan_id] = array_merge($result[$plan_id],$groups_tables[$group_id]);
//                    break;
//                }
//            }
            if(array_key_exists($plan_id,$result)){
                $result[$plan_id] = array_map("unserialize", array_unique(array_map("serialize", $result[$plan_id])));
            }
        }

        return response()->json($result);
    }

    public function getStripeClientSecret(Request $request): JsonResponse
    {
        $request->validate([
            'place_id' => 'required|exists:places,id'
        ]);

        $settings = Setting::where('place_id',$request->place_id)
            ->whereIn('name',['stripe-secret','stripe-key'])
            ->get();
        $output = [];
        $keys = [];
        foreach ($settings as $setting) {
            $parts = explode('_',$setting->value);
            if(count($parts) === 3){
                $keys[$setting->name] = $setting->value;
                $output[$setting->name] = $parts[0].'_'.$parts[1].'_n'.$parts[2].'s';
            }
        }
        if(!array_key_exists('stripe-secret',$keys)){
            return response()->json([
                'message' => 'Stripe secret key of the place is not set'
            ], 400);
        }

        $stripe = new StripeClient($keys['stripe-secret']);
        $customers = $stripe->customers->all(['email' => Auth::user()->email]);
        if(count($customers->data) > 0){
            $customer = $customers->data[0];
        }else{
            $customer = $stripe->customers->create([
                'email' => Auth::user()->email,
                'name' => Auth::user()->first_name.' '.Auth::user()->last_name,
                'phone' => Auth::user()->phone
            ]);
        }
        $setup_intent = $stripe->setupIntents->create([
            'customer' => $customer->id
        ]);

        $output['stripe-client-secret'] = $setup_intent->client_secret;
        return response()->json($output);
    }

    public function getPlacePaymentMethod($place_id, Request $request): JsonResponse
    {
        $settings = Setting::where('place_id',$place_id)
            ->whereIn('name',['is-online-payment','online-payment-amount','online-payment-currency','online-payment-method','online-payment-cancel-deadline'])
            ->get();
        $output = [];
        foreach ($settings as $setting) {
            $output[$setting->name] = $setting->value;
        }
        return response()->json($output);
    }

    public function getPlaceOnlineBookingDescription($place_id, Request $request): JsonResponse
    {
        $settings = Setting::where('place_id',$place_id)
            ->whereIn('name',['online-booking-description'])
            ->get();
        $output = [];
        foreach ($settings as $setting) {
            $output[$setting->name] = $setting->value;
        }
        return response()->json($output);
    }

    public function getPlaceOnlineBookingTitle($place_id, Request $request): JsonResponse
    {
        $settings = Setting::where('place_id',$place_id)
            ->whereIn('name',['online-booking-title'])
            ->get();
        $output = [];
        foreach ($settings as $setting) {
            $output[$setting->name] = $setting->value;
        }
        return response()->json($output);
    }

    public static function getAmountAfterDiscount($amount,$code,$currency,$place_id)
    {
        switch (strtolower($currency)) {
            case 'usd':
            case 'eur':
                $min = 0.5;
                break;
            case 'dkk':
                $min = 2.5;
                break;
            default:
                $min = 175;
        }

        $discount = Giftcard::getAmountByCode($code,$place_id);
        if($amount-$min <= $discount){
            return min($amount, $min);
        }else{
            return $amount - $discount;
        }
    }

    public function switchTables(Request $request): JsonResponse
    {
        $request->validate([
            'first_order_id' => 'required|exists:orders,id',
            'second_id' => 'required',
            'type' => ['required',Rule::in(['order', 'table'])]
        ]);
        $first_order = Order::find($request->first_order_id);

//        if(count($first_order->table_ids) > 1){
//            return response()->json([
//                'message' => 'First order has more then one table'
//            ], 400);
//        }

        $tableplan_data = $first_order->tableplan->data;
        $first_tables = array_values(array_filter($tableplan_data,function($item) use ($first_order) {
            return array_key_exists('number',$item) && in_array($item['number'],$first_order->table_ids);
        }));

        $first_tables_seats = 0;
        foreach ($first_tables as $first_table) {
            $first_tables_seats += $first_table['seats'];
        }

        if($request->type == 'order'){
            $second_order = Order::find($request->second_id);

            if(count($second_order->table_ids) > 1){
                return response()->json([
                    'message' => 'Second order has more then one table'
                ], 400);
            }

            $second_table = array_values(array_filter($tableplan_data,function($item) use ($second_order) {
                return array_key_exists('number',$item) && $item['number'] == $second_order->table_ids[0];
            }))[0];

            if($first_order->seats > $second_table['seats'] || $second_order->seats > $first_tables_seats){
                return response()->json([
                    'message' => 'There are more visitors than seats'
                ], 400);
            }

//            $first_reservation_time = $first_order->reservation_time;
//            $first_length = $first_order->length;
//            $second_reservation_time = $second_order->reservation_time;
//            $second_length = $second_order->length;
            $first_table_ids = $first_order->table_ids;
            $second_table_ids = $second_order->table_ids;

            $first_order->table_ids = $second_table_ids;
//            $first_order->reservation_time = $second_reservation_time;
//            $first_order->length = $second_length;
            $first_order->save();

            $second_order->table_ids = $first_table_ids;
//            $second_order->reservation_time = $first_reservation_time;
//            $second_order->length = $first_length;
            $second_order->save();
        }else{
            $second_table = array_values(array_filter($tableplan_data,function($item) use ($request) {
                return array_key_exists('number',$item) && $item['number'] == $request->second_id;
            }))[0];

            if($first_order->seats > $second_table['seats']){
                return response()->json([
                    'message' => 'There are more visitors than seats'
                ], 400);
            }

            $first_order->table_ids = [$request->second_id];
            $first_order->save();
        }

        return response()->json(['message' => 'Order switched successfully']);
    }
}
