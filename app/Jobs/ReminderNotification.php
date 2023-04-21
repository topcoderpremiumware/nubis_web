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
            $customer = $order->customer;

            if($order->reservation_time->diffInHours(Carbon::now()) <= $sms_hours_before){
                $reminder_template = MessageTemplate::where('place_id',$order->place_id)
                    ->where('purpose','sms-reminder')
                    ->where('language',$customer->language)
                    ->where('active',1)
                    ->first();
                $place = Place::find($order->place_id);

                if($reminder_template && $place->allow_send_sms()){
                    $place->decrease_sms_limit();
                    $result = SMS::send([$customer->phone], TemplateHelper::setVariables($order,$reminder_template->text), env('APP_SHORT_NAME'));
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
            if(!$order->customer) continue;
            $email_setting = Setting::where('place_id',$order->place_id)
                ->where('name','email-remind-hours-before')
                ->first();

            $email_hours_before = $email_setting ? (int) $email_setting->value : 6;
            $customer = $order->customer;

            if($order->reservation_time->diffInHours(Carbon::now()) <= $email_hours_before){
                $reminder_template = MessageTemplate::where('place_id',$order->place_id)
                    ->where('purpose','email-reminder')
                    ->where('language',$customer->language)
                    ->where('active',1)
                    ->first();
                if($reminder_template){
                    try{
                        \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$reminder_template->text), function($msg) use ($reminder_template, $customer) {
                            $msg->to($customer->email)->subject($reminder_template->subject);
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
