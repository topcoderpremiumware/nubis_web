<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\PaidBill;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\StripeClient;
use Stripe\Webhook;

class BillingController extends Controller
{
    public function getInvoiceByPrice(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'price_id' => 'required',
            'place_id' => 'required|exists:places,id'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $stripe = new StripeClient(env('STRIPE_SECRET'));
        $price = $stripe->prices->retrieve($request->price_id);
        $product = $stripe->products->retrieve($price->product);
        $duration = $price->recurring->interval === 'month' ? $price->recurring->interval_count :
            ($price->recurring->interval === 'year' ? $price->recurring->interval_count * 12 : 0);
//        if(!@$product->metadata->duration){
//            return response()->json([
//                'message' => 'There is no product metadata.duration parameter',
//                'product' => $product,
//                'price' => $price
//            ], 400);
//        }

        $place = Place::find($request->place_id);

        $link = $stripe->paymentLinks->create(
            [
                'line_items' => [['price' => $request->price_id, 'quantity' => 1]],
                'metadata' => [
                    'place_id' => $request->place_id,
                    'duration' => $duration,
                    'name' => $product->name,
                    'tax_number' => $place->tax_number
                ],
                'after_completion' => [
                    'type' => 'redirect',
                    'redirect' => ['url' => env('APP_URL').'/admin/ThankYou'],
                ],
            ]
        );

        return response()->json(['url'=> $link->url]);
    }

    public function payTrial($place_id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($place_id);
        $trial_bill = $place->paid_bills()->where('product_name','Trial')->first();

        if($trial_bill){
            return response()->json([
                'message' => 'Trial has already been used'
            ], 400);
        }

        $months_duration = 1;

        PaidBill::create([
            'place_id' => $place_id,
            'amount' => 0,
            'currency' => 'DKK',
            'payment_date' => \Carbon\Carbon::now(),
            'product_name' => 'Trial',
            'duration' => $months_duration,
            'expired_at' => \Carbon\Carbon::now()->addMonths($months_duration),
            'payment_intent_id' => '',
            'receipt_url' => ''
        ]);

        return response()->json(['result'=> 'OK']);
    }

    public function webhook(Request $request)
    {
        try {
            $event = Webhook::constructEvent(
                @file_get_contents('php://input'),
                $_SERVER['HTTP_STRIPE_SIGNATURE'],
                env('STRIPE_WEBHOOK_SECRET')
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
        $stripe = new StripeClient(env('STRIPE_SECRET'));
        $object = $event->data->object;
        $sessions = $stripe->checkout->sessions->all([$object->object => $object->id]);
        if(count($sessions->data) > 0) {
            $metadata = $sessions->data[0]->metadata;
            file_get_contents('https://api.telegram.org/bot5443827645:AAGY6C0f8YOLvqw9AtdxSoVcDVwuhQKO6PY/sendMessage?chat_id=600558355&text='.urlencode(json_encode($metadata)));
        }
        file_get_contents('https://api.telegram.org/bot5443827645:AAGY6C0f8YOLvqw9AtdxSoVcDVwuhQKO6PY/sendMessage?chat_id=600558355&text='.urlencode(json_encode($object)));
//        if ($event->type == 'payment_intent.succeeded') {
//            $stripe = new StripeClient(env('STRIPE_SECRET'));
//            $object = $event->data->object;
//
//            $sessions = $stripe->checkout->sessions->all([$object->object => $object->id]);
//            if(count($sessions->data) > 0){
//                $metadata = $sessions->data[0]->metadata;
//                $place_id = $metadata->place_id;
//                $duration = $metadata->duration;
//                $product_name = $metadata->name;
//
//                PaidBill::create([
//                    'place_id' => $place_id,
//                    'amount' => $object->amount / 100,
//                    'currency' => strtoupper($object->currency),
//                    'payment_date' => \Carbon\Carbon::now()->timestamp($object->created),
//                    'product_name' => $product_name,
//                    'duration' => $duration,
//                    'expired_at' => \Carbon\Carbon::now()->addMonths($duration),
//                    'payment_intent_id' => $object->id,
//                    'receipt_url' => $object->charges->data[0]->receipt_url
//                ]);
//            }
//        }
        return response()->json(['result'=> 'OK']);
    }
}
