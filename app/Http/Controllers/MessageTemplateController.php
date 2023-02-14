<?php

namespace App\Http\Controllers;

use App\Helpers\TemplateHelper;
use App\Jobs\SendBulkSms;
use App\Models\Log;
use App\Models\MessageTemplate;
use App\Models\Place;
use App\SMS\SMS;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageTemplateController extends Controller
{
    public function save($purpose, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'text' => 'required',
            'active' => 'required',
            'language' => 'required',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $template = MessageTemplate::updateOrCreate([
            'place_id' => $request->place_id,
            'purpose' => $request->purpose,
            'language' => $request->language],
            ['subject' => $request->subject ?? env('APP_NAME'),
            'text' => $request->text,
            'active' => $request->active
        ]);

        Log::add($request,'change-message_template','Changed message template #'.$template->id);

        return response()->json($template);
    }

    public function getId($purpose, Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'language' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose',$purpose)
            ->where('language',$request->language)
            ->firstOrFail();

        return response()->json($template);
    }

    public function getAllByPlace(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $template = MessageTemplate::where('place_id',$request->place_id)
            ->get();

        return response()->json($template);
    }

    public function sendTestSms(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'text' => 'required',
            'phone' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($request->place_id);
        $smsApiToken = $place->setting('sms-api-token');
        if($smsApiToken){
            $result = SMS::send([$request->phone], $request->text, env('APP_SHORT_NAME'), $smsApiToken);
        }else{
            return response()->json([
                'message' => 'SMS API Token is not set'
            ], 400);
        }

        return response()->json(['message' => 'The message has been sent', 'result' => $result]);
    }

    public function getBulkCount(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'type' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($request->place_id);
        $phones = $this->getPhonesByType($request->type,$place);

        return response()->json(['phones_count' => count($phones)]);
    }

    public function sendBulkSms(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'text' => 'required',
            'type' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($request->place_id);
        $smsApiToken = $place->setting('sms-api-token');

        if($smsApiToken){
            $phones = $this->getPhonesByType($request->type,$place);
            dispatch(new SendBulkSms($phones, TemplateHelper::setPlaceVariables($place,$request->text), $smsApiToken));
        }else{
            return response()->json([
                'message' => 'SMS API Token is not set'
            ], 400);
        }

        return response()->json(['message' => 'The message has been sent']);
    }

    private function getPhonesByType($type,$place)
    {
        $phones = [];
        if($type == 'myself'){
            $phones = [Auth::user()->phone];
        }elseif($type == 'admins_waiters'){
            $phones = $place->users()->pluck('phone')->toArray();
        }elseif($type == 'admins'){
            $phones = $place->admins()->pluck('phone')->toArray();
        }elseif($type == 'waiters'){
            $phones = $place->waiters()->pluck('phone')->toArray();
        }elseif($type == 'all_customers'){
            $orders = $place->orders;
            foreach ($orders as $order) {
                $phones[] = $order->customer->phone;
            }
        }elseif($type == 'subscribed_customers'){
            $orders = $place->orders;
            foreach ($orders as $order) {
                $customer = $order->customer;
                if($customer->allow_send_emails){
                    $phones[] = $customer->phone;
                }
            }
        }elseif($type == 'todays_future_customers'){
            $orders = $place->orders()
                ->whereBetween('reservation_time', [Carbon::now()->format('Y-m-d H:i:s'), Carbon::tomorrow()->format('Y-m-d 00:00:00')])
                ->where('status','confirmed')->get();
            foreach ($orders as $order) {
                $phones[] = $order->customer->phone;
            }
        }elseif($type == 'todays_waitinglist_customers'){
            $orders = $place->orders()
                ->whereBetween('reservation_time', [Carbon::now()->format('Y-m-d H:i:s'), Carbon::tomorrow()->format('Y-m-d 00:00:00')])
                ->where('status','waiting')->get();
            foreach ($orders as $order) {
                $phones[] = $order->customer->phone;
            }
        }elseif($type == 'yesterdays_no_show_customers'){
            $orders = $place->orders()
                ->whereBetween('reservation_time', [Carbon::yesterday()->format('Y-m-d 00:00:00'), Carbon::today()->format('Y-m-d 00:00:00')])
                ->where('status','no_show')->get();
            foreach ($orders as $order) {
                $phones[] = $order->customer->phone;
            }
        }
        return array_filter($phones);
    }

    public function sendTestEmail(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'text' => 'required',
            'subject' => 'required',
            'mail' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        \Illuminate\Support\Facades\Mail::html($request->text, function($msg) use ($request) {$msg->to($request->mail)->subject($request->subject); });

        return response()->json(['message' => 'The message has been sent']);
    }
}
