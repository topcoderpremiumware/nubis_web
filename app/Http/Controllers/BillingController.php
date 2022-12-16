<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\PaidBill;
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
        if(!property_exists($product,'metadata') || !property_exists($product->metadata,'duration')){
            return response()->json([
                'message' => 'There is no product metadata.duration parameter'
            ], 400);
        }

        $link = $stripe->paymentLinks->create(
            [
                'line_items' => [['price' => $request->price_id, 'quantity' => 1]], //price_1MED982eZvKYlo2CZLQdP554
                'metadata' => [
                    'place_id' => $request->place_id,
                    'duration' => $product->metadata->duration,
                    'name' => $product->name
                ],
                'after_completion' => [
                    'type' => 'redirect',
                    'redirect' => ['url' => env('APP_URL')],
                ],
            ]
        );

        return response()->json(['url'=> $link->url]);
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
        if ($event->type == 'payment_intent.succeeded') {
            $stripe = new StripeClient(env('STRIPE_SECRET'));
            $object = $event->data->object;

            $sessions = $stripe->checkout->sessions->all([$object->object => $object->id]);
            if(count($sessions->data) > 0){
                $metadata = $sessions->data[0]->metadata;
                $place_id = $metadata->place_id;
                $duration = $metadata->duration;
                $product_name = $metadata->name;

                PaidBill::create([
                    'place_id' => $place_id,
                    'amount' => $object->amount / 100,
                    'currency' => strtoupper($object->currency),
                    'payment_date' => \Carbon\Carbon::now()->timestamp($object->created),
                    'product_name' => $product_name,
                    'duration' => $duration,
                    'expire_date' => \Carbon\Carbon::now()->addMonths($duration),
                    'payment_intent_id' => $object->id,
                    'receipt_url' => $object->charges->data[0]->receipt_url
                ]);
            }
        }
        return response()->json(['result'=> 'OK']);
    }
}
