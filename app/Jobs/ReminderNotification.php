<?php

namespace App\Jobs;


use App\Models\Customer;
use App\Models\MessageTemplate;
use App\Models\Order;
use App\Models\Setting;
use App\SMS\SMS;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;


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
        $orders = Order::where('marks','not like','%reminded%')->get();
        foreach ($orders as $order){
            $setting = Setting::where('place_id',$order->place_id)
                ->where('name','remind-hours-before')
                ->first();
            $hours_before = 1;
            if($setting){
                $hours_before = (int) $setting->value;
            }
            if($order->reservation_time->diffInHours(Carbon::now()) <= $hours_before){
                // TODO: get SMS API token of current place and set in to send function as 4th param
                $customer = $order->customer;
                $reminder_template = MessageTemplate::where('place_id',$order->place_id)
                    ->where('purpose','sms-reminder')
                    ->where('language',$customer->language)
                    ->where('active',1)
                    ->first();
                if($reminder_template){
                    $result = SMS::send([$customer->phone], $reminder_template->text, env('APP_NAME'));
                }
                $marks = $order->marks;
                $marks['reminded'] = true;
                $order->marks = $marks;
                $order->save();
            }
        }

    }
}
