<?php

namespace App\Http\Controllers;

use App\Helpers\TemplateHelper;
use App\Models\Customer;
use App\Models\Log;
use App\Models\MessageTemplate;
use App\Models\Order;
use App\Models\Place;
use App\Models\Tableplan;
use App\SMS\SMS;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Stripe\StripeClient;
use Stripe\Webhook;

class OrderController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'customer_id' => 'exists:customers,id',
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
            'marks' => '',
            'custom_booking_length_id' => $request->custom_booking_length_id
        ]);

        Log::add($request,'create-order','Created order #'.$order->id);

        $customer = Customer::find($request->customer_id);
        $sms_confirmation_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','sms-confirmation')
            ->where('language',$customer->language)
            ->where('active',1)
            ->first();
        $smsApiToken = $place->setting('sms-api-token');
        if($sms_confirmation_template && $smsApiToken){
            $result = SMS::send([$customer->phone], TemplateHelper::setVariables($order,$sms_confirmation_template->text), env('APP_NAME'), $smsApiToken);
        }
        $email_confirmation_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','email-confirmation')
            ->where('language',$customer->language)
            ->where('active',1)
            ->first();
        if($email_confirmation_template){
            \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_confirmation_template->text), function($msg) use ($email_confirmation_template, $customer) {
                $msg->to($customer->email)->subject($email_confirmation_template->subject);
            });
        }

        return response()->json($order);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'customer_id' => 'exists:customers,id',
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
            'marks' => $request->marks ?? '',
            'custom_booking_length_id' => $request->custom_booking_length_id
        ]);

        Log::add($request,'change-order','Changed order #'.$order->id);

        $customer = Customer::find($request->customer_id);
        $sms_change_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','sms-change')
            ->where('language',$customer->language)
            ->where('active',1)
            ->first();
        $place = Place::find($request->place_id);
        $smsApiToken = $place->setting('sms-api-token');
        if($sms_change_template && $smsApiToken){
            $result = SMS::send([$customer->phone], TemplateHelper::setVariables($order,$sms_change_template->text), env('APP_NAME'), $smsApiToken);
        }
        $email_change_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','email-change')
            ->where('language',$customer->language)
            ->where('active',1)
            ->first();
        if($email_change_template){
            \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_change_template->text), function($msg) use ($email_change_template, $customer) {
                $msg->to($customer->email)->subject($email_change_template->subject);
            });
        }

        if($res){
            $order = Order::find($id);
            return response()->json($order);
        }else{
            return response()->json(['message' => 'Order not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $order = Order::where('id',$id)->with(['customer', 'custom_booking_length'])->first();

        if(!Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($order);
    }

    public function getAllByParams(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'reservation_from' => 'required|date_format:Y-m-d H:i:s',
            'reservation_to' => 'required|date_format:Y-m-d H:i:s',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $orders = Order::where('place_id',$request->place_id)
            ->where('area_id',$request->area_id)
            ->with(['customer', 'custom_booking_length'])
            ->whereBetween('reservation_time', [$request->reservation_from, $request->reservation_to]);
        if($request->has('deleted')){
            $orders = $orders->onlyTrashed();
        }
        $orders = $orders->get();

        return response()->json($orders);
    }

    public function getAllByCustomer(Request $request)
    {
        if(!Auth::user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $orders = Order::where('customer_id',Auth::user()->id)
            ->with('custom_booking_length')
            ->get();

        return response()->json($orders);
    }

    public function delete($id, Request $request)
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

        $customer = Customer::find($request->customer_id);
        $sms_delete_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','sms-delete')
            ->where('language',$customer->language)
            ->where('active',1)
            ->first();
        $place = Place::find($request->place_id);
        $smsApiToken = $place->setting('sms-api-token');
        if($sms_delete_template && $smsApiToken){
            $result = SMS::send([$customer->phone], TemplateHelper::setVariables($order,$sms_delete_template->text), env('APP_NAME'), $smsApiToken);
        }
        $email_delete_template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose','email-delete')
            ->where('language',$customer->language)
            ->where('active',1)
            ->first();
        if($email_delete_template){
            \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_delete_template->text), function($msg) use ($email_delete_template, $customer) {
                $msg->to($customer->email)->subject($email_delete_template->subject);
            });
        }

        $order->delete();

        return response()->json(['message' => 'Order is deleted']);
    }

    public function cancel($id, Request $request)
    {
        $order = Order::find($id);

        if(!$order){
            return response()->json([
                'message' => 'Order is not exist'
            ], 400);
        }

        if(Auth::user()->id !== $order->customer_id){
            return response()->json([
                'message' => 'It\'s not your order'
            ], 400);
        }

        $order->delete();

        return response()->json(['message' => 'Order is canceled']);
    }

    public function setStatus($id, Request $request)
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

        $res = $order->update([
            'status' => $request->status,
        ]);

        Log::add($request,'change-order-status','Changed order #'.$order->id.' status '.$request->status);

        return response()->json(['message' => 'Order status changed']);
    }

    public function freeDates(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d',
        ]);

        $period = CarbonPeriod::create($request->from, $request->to);
        $result = [];
        foreach ($period as $date) {
            if($date->lt(Carbon::now()->setTime(0,0,0))) continue;
            $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$date->format("Y-m-d"));
            if(empty($working_hours)) continue;
            $time_from = $date->copy();
            $time_from->setTime(0, 0, 0);
            $time_to = $date->copy();
            $time_to->setTime(23, 59, 59);
            $orders = Order::where('place_id',$request->place_id)
                ->where('area_id',$request->area_id)
                ->whereBetween('reservation_time',[$time_from,$time_to])
                ->where('is_take_away',0)
                ->get();

            if($this->getFreeTables($orders, $working_hours, $request->seats)){
                array_push($result,$date);
            }
        }
        return response()->json($result);
    }

    public function workDates(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d',
        ]);

        $period = CarbonPeriod::create($request->from, $request->to);
        $result = [];
        foreach ($period as $date) {
            if($date->lt(Carbon::now()->setTime(0,0,0))) continue;
            $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$date->format("Y-m-d"));
            if(empty($working_hours)) continue;
            if($this->getFreeTables([], $working_hours, $request->seats)){
                array_push($result,$date);
            }
        }
        return response()->json($result);
    }

    public function freeTime(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'date' => 'required|date_format:Y-m-d',
        ]);
        $request_date = Carbon::parse($request->date);
        if($request_date->lt(Carbon::now()->setTime(0,0,0))) return response()->json([
            'message' => 'Date must be today and later'
        ], 400);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$request_date->format("Y-m-d"));
        if(empty($working_hours)) return response()->json([
            'message' => 'Non-working day'
        ], 400);

        $time_from = $request_date->copy();
        $time_from->setTime(0, 0, 0);
        $time_to = $request_date->copy();
        $time_to->setTime(23, 59, 59);
        $orders = Order::where('place_id',$request->place_id)
            ->where('area_id',$request->area_id)
            ->whereBetween('reservation_time',[$time_from,$time_to])
            ->where('is_take_away',0)
            ->get();

        $free_tables = $this->getFreeTables($orders, $working_hours, $request->seats, false);
        $free_time = [];
        foreach($working_hours as $working_hour){
            $time = Carbon::parse($request->date.' '.$working_hour['from']);
            $end = Carbon::parse($request->date.' '.$working_hour['to']);
            for($time;$time->lt($end);$time->addMinutes(15)){
                $indexFrom = intval($time->format('H'))*4 + floor(intval($time->format('i'))/15);
                if(array_key_exists($working_hour['tableplan_id'],$free_tables)) {
                    foreach ($free_tables[$working_hour['tableplan_id']] as $table) {
                        if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                            if (!$time->lt(Carbon::now())) {
                                array_push($free_time, $time->copy());
                                break;
                            }
                        }
                    }
                }
            }
        }
        return response()->json($free_time);
    }

    public function workTime(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'date' => 'required|date_format:Y-m-d',
        ]);
        $request_date = Carbon::parse($request->date);
        if($request_date->lt(Carbon::now()->setTime(0,0,0))) return response()->json([
            'message' => 'Date must be today and later'
        ], 400);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$request_date->format("Y-m-d"));
        if(empty($working_hours)) return response()->json([
            'message' => 'Non-working day'
        ], 400);

        $free_tables = $this->getFreeTables([], $working_hours, $request->seats, false);
        $work_time = [];
        foreach($working_hours as $working_hour){
            $time = Carbon::parse($request->date.' '.$working_hour['from']);
            $end = Carbon::parse($request->date.' '.$working_hour['to']);
            for($time;$time->lt($end);$time->addMinutes(15)){
                $indexFrom = intval($time->format('H'))*4 + floor(intval($time->format('i'))/15);
                if(array_key_exists($working_hour['tableplan_id'],$free_tables)){
                    foreach ($free_tables[$working_hour['tableplan_id']] as $table){
                        if(!array_key_exists('ordered',$table['time'][$indexFrom])){
                            if(!$time->lt(Carbon::now())){
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

    private function getFreeTables($orders,$working_hours,$seats,$boolean = true)
    {
        $free_tables = [];
        foreach ($working_hours as $working_hour){
            $tableplan = Tableplan::find($working_hour['tableplan_id']);
            $tables = $tableplan->getTables();
            foreach ($tables as $tab){
                if($tab['seats'] < $seats) continue;
                if(empty(array_filter($tab['time'],function($t) use ($seats) {
                    return ($t['is_online'] && ($t['min_seats'] <= $seats /*&& $t['group'] == 0*/));
                }))) continue;
                if(!array_key_exists($tableplan->id,$free_tables) || !array_key_exists($tab['number'],$free_tables[$tableplan->id])){
                    $free_tables[$tableplan->id][$tab['number']] = $tab;
                }
            }
        }
        foreach ($orders as $order){
            if(array_key_exists($order->tableplan_id,$free_tables)){
                $reservTo = $order->reservation_time->copy();
                $reservTo = $reservTo->addMinutes($order->length);
                $indexFrom = intval($order->reservation_time->format('H'))*4 + floor(intval($order->reservation_time->format('i'))/15);
                $indexTo = intval($reservTo->format('H'))*4 + floor(intval($reservTo->format('i'))/15);
                foreach ($order->table_ids as $table_id){
                    if(array_key_exists($table_id,$free_tables[$order->tableplan_id])) {
                        for($i = $indexFrom;$i<=$indexTo;$i++){
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

    public function makeOrder(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'reservation_time' => 'required|date_format:Y-m-d H:i:s',
            'is_take_away' => 'required|boolean',
        ]);

        $reservation_time = Carbon::parse($request->reservation_time);
        if($reservation_time->lt(Carbon::now())) return response()->json([
            'message' => 'Time must be in the future'
        ], 400);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$reservation_time->format("Y-m-d"));
        if(empty($working_hours)) return response()->json([
            'message' => 'Non-working day'
        ], 400);

        $tableplan_id = null;
        $table_ids = [];
        $length = 0;
        if($request->has('length') && intval($request->length) > 0){
            $length = intval($request->length);
        }

        $status = ($request->has('status') && $request->status === 'waiting') ? 'waiting' : 'ordered';

        if(!$request->is_take_away && $status === 'ordered'){
            $time_from = $reservation_time->copy();
            $time_from->setTime(0, 0, 0);
            $time_to = $reservation_time->copy();
            $time_to->setTime(23, 59, 59);
            $orders = Order::where('place_id',$request->place_id)
                ->where('area_id',$request->area_id)
                ->whereBetween('reservation_time',[$time_from,$time_to])
                ->where('is_take_away',0)
                ->get();

            $free_tables = $this->getFreeTables($orders, $working_hours, $request->seats, false);

            $indexFrom = intval($reservation_time->format('H'))*4 + floor(intval($reservation_time->format('i'))/15);
            foreach ($free_tables as $plan_id => $tables){
                foreach ($tables as $table) {
                    if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                        if(!$length) $length = intval($table['time'][$indexFrom]['booking_length']);
                        if(!$length) $length = 120;
                        $reserv_to = $reservation_time->copy()->addMinutes($length);
                        $indexTo = intval($reserv_to->format('H'))*4 + floor(intval($reserv_to->format('i'))/15);
                        for($i = $indexFrom;$i<=$indexTo;$i++){
                            if(array_key_exists('ordered', $table['time'][$i])){
                                continue 2;
                            }
                        }
                        $table_ids = [$table['number']];
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
                'message' => 'There are no free tables for the required time'
            ], 400);
        }

        $order = Order::create([
            'customer_id' => Auth::user()->id,
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
            'marks' => '',
            'custom_booking_length_id' => $request->custom_booking_length_id
        ]);

        $place = Place::find($request->place_id);
        if(intval($place->setting('is-online-payment')) === 1) {
            if ($place->setting('online-payment-method') === 'deduct') {
                $prepayment_url = $this->getPrepaymentUrl($request, $order);
                if ($prepayment_url) {
                    $order->status = 'pending';
                    $order->marks = [
                        'method' => 'deduct',
                        'amount' => $place->setting('online-payment-amount') * $request->seats,
                        'currency' => $place->setting('online-payment-currency'),
                        'cancel_deadline' => $place->setting('online-payment-cancel-deadline')
                    ];
                    $order->timestamps = false;
                    $order->save();
                }
            } else {
                if(!$request->has('number') || !$request->has('exp_month') || !$request->has('exp_year') || !$request->has('cvc')){
                    return response()->json([
                        'message' => 'There are no some card data like number, exp_month, exp_year, cvc'
                    ], 400);
                }
                $marks = $this->processPaymentAlgorithm($request);
                if ($marks) {
                    $order->marks = $marks;
                    $order->timestamps = false;
                    $order->save();
                }
            }
        }

        if(!$prepayment_url){
            $this->sendNewOrderNotification($order,$place);
        }

        $order->prepayment_url = $prepayment_url;
        return response()->json($order);
    }

    private function getPrepaymentUrl($request,$order)
    {
        $url = '';
        $place = Place::find($request->place_id);

        $online_payment_amount = $place->setting('online-payment-amount') * $order->seats;
        $online_payment_currency = $place->setting('online-payment-currecy');
        $stripe_secret = $place->setting('stripe-secret');
        $stripe_webhook_secret = $place->setting('stripe-webhook-secret');

        if($stripe_secret && $stripe_webhook_secret && $online_payment_currency){
            $stripe = new StripeClient($stripe_secret);
            $price = $stripe->prices->create([
                'unit_amount' => $online_payment_amount,
                'currency' => $online_payment_currency,
                'product_data' => [
                    'name' => 'Prepayment'
                ]
            ]);

            $link = $stripe->paymentLinks->create(
                [
                    'line_items' => [['price' => $price->id, 'quantity' => 1]],
                    'metadata' => [
                        'place_id' => $request->place_id,
                        'order_id' => $order->id
                    ],
                    'after_completion' => [
                        'type' => 'redirect',
                        'redirect' => ['url' => env('APP_URL')],
                    ],
                ]
            );
            $url = $link->url;
        }

        return $url;
    }

    private function processPaymentAlgorithm($request)
    {
        $place = Place::find($request->place_id);
        $method = $place->setting('online-payment-method');
        $amount = $place->setting('online-payment-amount') * $request->seats;
        $currency = $place->setting('online-payment-currency');
        $cancel_deadline = $place->setting('online-payment-cancel-deadline');
        $marks = [
            'method' => $method,
            'amount' => $amount,
            'currency' => $currency,
            'cancel_deadline' => $cancel_deadline
        ];
        $stripe_secret = $place->setting('stripe-secret');
        $stripe = new StripeClient($stripe_secret);
        //TODO:
        if($method === 'reserve'){ // 2) Перший метод вже є для другого треба блокувати гроші

        }elseif($method === 'no_show'){ // 3) для третього методу треба створити card_token і його ід записати в marks
            $card_token = $stripe->tokens->create([
                'card' => [
                    'number' => $request->number,
                    'exp_month' => $request->exp_month,
                    'exp_year' => $request->exp_year,
                    'cvc' => $request->cvc
                ]
            ]);
            $marks['card_token_id'] = $card_token->id;
        }

        return $marks;
    }

    private function sendNewOrderNotification($order,$place)
    {
        $sms_confirmation_template = MessageTemplate::where('place_id',$order->place_id)
            ->where('purpose','sms-confirmation')
            ->where('language',$order->customer->language)
            ->where('active',1)
            ->first();
        $smsApiToken = $place->setting('sms-api-token');
        if($sms_confirmation_template && $smsApiToken){
            $result = SMS::send([$order->customer->phone], TemplateHelper::setVariables($order,$sms_confirmation_template->text), env('APP_NAME'), $smsApiToken);
        }
        $email_confirmation_template = MessageTemplate::where('place_id',$order->place_id)
            ->where('purpose','email-confirmation')
            ->where('language',$order->customer->language)
            ->where('active',1)
            ->first();
        if($email_confirmation_template){
            \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_confirmation_template->text), function($msg) use ($order, $email_confirmation_template) {
                $msg->to($order->customer->email)->subject($email_confirmation_template->subject);
            });
        }

        $sms_notification_template = MessageTemplate::where('place_id',$order->place_id)
            ->where('purpose','sms-notification')
            ->where('active',1)
            ->first();
        if($sms_notification_template && $smsApiToken){
            $result = SMS::send([$place->setting('sms-notification-number')], TemplateHelper::setVariables($order,$sms_notification_template->text), env('APP_NAME'), $smsApiToken);
        }
    }

    public function freeTables(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'seats' => 'required|integer',
            'reservation_time' => 'required|date_format:Y-m-d H:i:s'
        ]);

        $reservation_time = Carbon::parse($request->reservation_time);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$reservation_time->format("Y-m-d"));
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
            ->get();

        $free_tables = $this->getFreeTables($orders, $working_hours, $request->seats, false);

        return response()->json($free_tables);
    }

    public function webhook($place_id, Request $request)
    {
        $place = Place::find($place_id);
        $stripe_secret = $place->setting('stripe-secret');
        $stripe_webhook_secret = $place->setting('stripe-webhook-secret');
        try {
            $event = Webhook::constructEvent(
                @file_get_contents('php://input'),
                $_SERVER['HTTP_STRIPE_SIGNATURE'],
                $stripe_webhook_secret
            );
        } catch(\UnexpectedValueException $e) {
            // Invalid payload
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
            exit();
        } catch(\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
            exit();
        }
        if ($event->type == 'payment_intent.succeeded') {
            $stripe = new StripeClient($stripe_secret);
            $object = $event->data->object;

            $sessions = $stripe->checkout->sessions->all([$object->object => $object->id]);
            if(count($sessions->data) > 0){
                $metadata = $sessions->data[0]->metadata;
                $order_id = $metadata->order_id;

                $order = Order::find($order_id);
                $order->status = 'ordered';
                $order->save();

                if($order->marks['method'] === 'deduct'){
                    $this->sendNewOrderNotification($order,$place);
                }
            }
        }
        return response()->json(['result'=> 'OK']);
    }
}
