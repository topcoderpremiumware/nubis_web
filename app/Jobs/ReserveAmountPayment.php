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
use Stripe\StripeClient;


class ReserveAmountPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->sendNotificationWithPaymentLink();
        $this->capturePaymentIntent();
    }

    protected  function sendNotificationWithPaymentLink()
    {
        $orders = Order::where('marks','like','%need_send_payment_link%')->get();
        foreach ($orders as $order){
            if(Carbon::now()->lt($order->reservation_time) && Carbon::now()->diffInDays($order->reservation_time,false) <= 6){
                $place = Place::find($order->place_id);

                $online_payment_amount = $order->marks['amount'];
                $online_payment_currency = $order->marks['currency'];
                $stripe_secret = $place->setting('stripe-secret');
                $smsApiToken = $place->setting('sms-api-token');

                $stripe = new StripeClient($stripe_secret);

                $price = $stripe->prices->create([
                    'unit_amount' => $online_payment_amount * 100,
                    'currency' => $online_payment_currency,
                    'product_data' => [
                        'name' => 'Prepayment'
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
                            'redirect' => ['url' => env('APP_URL')],
                        ],
                    ]
                );
                $order->payment_link = $link->url;

                if($smsApiToken){
                    $result = SMS::send([$order->customer->phone], $link->url, env('APP_SHORT_NAME'), $smsApiToken);
                }
                $email_template = MessageTemplate::where('place_id',$order->place_id)
                    ->where('purpose','email-payment-request')
                    ->where('language',$order->customer->language)
                    ->where('active',1)
                    ->first();
                if($email_template) {
                    try{
                        \Illuminate\Support\Facades\Mail::html(TemplateHelper::setVariables($order,$email_template->text), function ($msg) use ($email_template, $order) {
                            $msg->to($order->customer->email)->subject($email_template->subject);
                        });
                        $marks = $order->marks;
                        unset($marks['need_send_payment_link']);
                        $order->marks = $marks;
                        $order->save();
                    }catch (\Exception $e){
                        Log::error($e->getMessage());
                    }
                }
            }
        }
    }

    protected  function capturePaymentIntent()
    {
        $orders = Order::where('marks','like','%need_capture%')->get();
        foreach ($orders as $order){
            if(Carbon::now()->lt($order->reservation_time) && Carbon::now()->diffInHours($order->reservation_time,false) <= 6) {
                $place = Place::find($order->place_id);
                $payment_intent_id = $order->marks['payment_intent_id'];
                $stripe_secret = $place->setting('stripe-secret');
                $online_payment_amount = $order->marks['amount'];
                $online_payment_currency = $order->marks['currency'];

                $stripe = new StripeClient($stripe_secret);

                $payment_intent = $stripe->paymentIntents->retrieve($payment_intent_id);
                $payment_intent->capture();

                $marks = $order->marks;
                unset($marks['need_capture']);
                $order->marks = $marks;
                $order->save();
            }
        }
    }
}
