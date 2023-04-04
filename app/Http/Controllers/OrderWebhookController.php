<?php

namespace App\Http\Controllers;

use App\Models\Giftcard;
use App\Models\Order;
use App\Models\Place;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Stripe\StripeClient;
use Stripe\Webhook;

class OrderWebhookController extends Controller
{
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
            }else{
                $metadata = $object->metadata;
            }

            if(array_key_exists('order_id',$metadata->toArray())){
                $order_id = $metadata->order_id;
                $order = Order::find($order_id);
                $marks = $order->marks;
                if(!$marks) $marks = [];
                $marks['payment_intent_id'] = $object->id;
                $order->marks = $marks;
                $order->status = 'confirmed';
                $order->save();

                if($order->marks['method'] === 'deduct' || $order->marks['method'] === 'reserve'){
                    if(array_key_exists('giftcard_code',$order->marks) && $order->marks['giftcard_code']){
                        $amount = $order->marks['amountWithoutDiscount'];
                        $amount_after_discount = OrderController::getAmountAfterDiscount($amount,$order->marks['giftcard_code'],$order->marks['currency'],$place_id);
                        $discount = $amount - $amount_after_discount;
                        $giftcard = Giftcard::where('code',$order->marks['giftcard_code'])
                            ->first();
                        if($giftcard){
                            $giftcard->spend($discount);
                        }
                    }
                }

                if($order->marks['method'] === 'deduct'){
                    OrderController::sendNewOrderNotification($order,$place);
                }
            }

            if(array_key_exists('giftcard_id',$metadata->toArray())){
                $giftcard_id = $metadata->giftcard_id;
                $giftcard = Giftcard::find($giftcard_id);
                $giftcard->status = 'confirmed';
                $giftcard->save();

                $place = Place::find($giftcard->place_id);
                $currency = $place->setting('online-payment-currency');
                try{
                    $text = 'The '.$giftcard->initial_amount.' '.$currency.' giftcard of '.$place->name.' was created. It can be used by specifying the code: '.$giftcard->code.'. The restaurant is located at '.$place->address.', '.$place->city.', '.$place->country->name.'. '.$place->home_page;

                    $html = view('pdfs.giftcard', compact('giftcard'))->render();
                    $options = new Options();
                    $options->set('enable_remote', TRUE);
                    $options->set('enable_html5_parser', FALSE);
                    $dompdf = new Dompdf($options);
                    $dompdf->loadHtml($html);
                    $dompdf->setPaper('A4');
                    $dompdf->render();

                    \Illuminate\Support\Facades\Mail::html($text, function($msg) use ($dompdf, $giftcard) {
                        $msg->to($giftcard->email)->subject('Giftcard');
                        $msg->attachData($dompdf->output(), 'giftcard.pdf');
                    });
                    if($giftcard->receiver_email){
                        \Illuminate\Support\Facades\Mail::html($text, function($msg) use ($dompdf, $giftcard) {
                            $msg->to($giftcard->receiver_email)->subject('Giftcard');
                            $msg->attachData($dompdf->output(), 'giftcard.pdf');
                        });
                    }
                }catch (\Exception $e){

                }
            }
        }
        return response()->json(['result'=> 'OK']);
    }
}
