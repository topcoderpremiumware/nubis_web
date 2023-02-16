<?php

namespace App\Http\Controllers;

use App\Models\Giftcard;
use App\Models\Order;
use App\Models\Place;
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

                if(property_exists($metadata,'order_id')){
                    $order_id = $metadata->order_id;

                    $order = Order::find($order_id);
                    $marks = $order->marks;
                    if(!$marks) $marks = [];
                    $marks['payment_intent_id'] = $object->id;
                    $order->marks = $marks;
                    $order->status = 'confirmed';
                    $order->save();

                    if($order->marks['method'] === 'deduct'){
                        $this->sendNewOrderNotification($order,$place);
                    }
                }
                if(property_exists($metadata, 'giftcard_id')){
                    $giftcard_id = $metadata->giftcard_id;
                    $giftcard = Giftcard::find($giftcard_id);
                    $giftcard->status = 'confirmed';
                    $giftcard->save();
                }
            }
        }
        return response()->json(['result'=> 'OK']);
    }
}
