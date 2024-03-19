<?php

namespace App\Jobs;


use App\Helpers\TemplateHelper;
use App\Models\Customer;
use App\Models\MessageTemplate;
use App\Models\Order;
use App\Models\Place;
use App\Models\Setting;
use App\SMS\SMS;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;


class ReminderNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->smsRemind();
        $this->emailRemind();
    }

    protected function smsRemind()
    {
        $orders = Order::where('marks','not like','%sms_reminded%')
            ->whereNotNull('customer_id')
            ->get();
        foreach ($orders as $order){
            if(!$order->customer) continue;
            $sms_setting = Setting::where('place_id',$order->place_id)
                ->where('name','sms-remind-hours-before')
                ->first();

            $sms_hours_before = $sms_setting ? (int) $sms_setting->value : 6;
            $place = Place::find($order->place_id);
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

            if($order->reservation_time->diffInHours($place->country->timeNow()) <= $sms_hours_before){
                $reminder_template = MessageTemplate::where('place_id',$order->place_id)
                    ->where('purpose','sms-reminder')
                    ->where('language',$customer_language)
                    ->where('active',1)
                    ->first();


                if($reminder_template && $place->allow_send_sms() && $customer_phone){
                    $place->decrease_sms_limit();
                    $result = SMS::send([$customer_phone], TemplateHelper::setVariables($order,$reminder_template->text,$customer_language), env('APP_SHORT_NAME'));
                }
                $marks = $order->marks;
                if(!$marks) $marks = [];
                $marks['sms_reminded'] = true;
                $order->marks = $marks;
                $order->save();
            }
        }
    }
    protected function emailRemind()
    {
        $orders = Order::where('marks','not like','%email_reminded%')
            ->whereNotNull('customer_id')
            ->get();
        foreach ($orders as $order){
            if(!$order->customer || !$order->first_name) continue;
            $email_setting = Setting::where('place_id',$order->place_id)
                ->where('name','email-remind-hours-before')
                ->first();

            $email_hours_before = $email_setting ? (int) $email_setting->value : 6;
            if($order->customer_id) {
                $customer = $order->customer;
                $customer_language = $customer->language;
                $customer_phone = $customer->phone;
                $customer_email = $customer->email;
            }else {
                $customer_language = $order->place->language;
                $customer_phone = $order->phone;
                $customer_email = $order->email;
            }

            if($order->reservation_time->diffInHours($order->place->country->timeNow()) <= $email_hours_before){
                $reminder_template = MessageTemplate::where('place_id',$order->place_id)
                    ->where('purpose','email-reminder')
                    ->where('language',$customer_language)
                    ->where('active',1)
                    ->first();
                if($reminder_template && $customer_email){
                    try{
                        $place = Place::find($order->place_id);
                        \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$reminder_template->text,$customer_language), function($msg) use ($place,$reminder_template, $customer_email) {
                            $msg->to($customer_email)->subject($reminder_template->subject);
                            $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                        });
                    }catch (\Exception $e){
                        Log::error($e->getMessage());
                    }
                }
                $marks = $order->marks;
                if(!$marks) $marks = [];
                $marks['email_reminded'] = true;
                $order->marks = $marks;
                $order->save();
            }
        }
    }
}
