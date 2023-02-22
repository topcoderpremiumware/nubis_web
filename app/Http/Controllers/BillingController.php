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
            ($price->recurring->interval === 'year' ? $price->recurring->interval_count * 12 : 1);

        $place = Place::find($request->place_id);

        $payment_link_data = [
            'line_items' => [['price' => $request->price_id, 'quantity' => 1]],
            'metadata' => [
                'organization_id' => $place->organization_id,
                'duration' => $duration,
                'name' => $product->name,
                'tax_number' => $place->tax_number
            ],
            'automatic_tax' => [
                'enabled' => true
            ],
            'tax_id_collection' => [
                'enabled' => true
            ],
            'after_completion' => [
                'type' => 'redirect',
                'redirect' => ['url' => env('APP_URL').'/admin/ThankYou'],
            ],
        ];

        if(count($place->organization->paid_bills) === 0){
            $payment_link_data['subscription_data'] = ['trial_period_days' => 30];
        }

        $link = $stripe->paymentLinks->create($payment_link_data);

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
        $trial_bill = $place->organization->paid_bills()->where('product_name','Trial')->first();

        if($trial_bill){
            return response()->json([
                'message' => 'Trial has already been used'
            ], 400);
        }

        $months_duration = 1;

        PaidBill::create([
            'organization_id' => $place->organization_id,
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

        if ($event->type == 'invoice.payment_succeeded') {
            $stripe = new StripeClient(env('STRIPE_SECRET'));
            $object = $event->data->object;
            $customer_id = $object->customer;
            $organization_id = false;

//            $sessions = $stripe->checkout->sessions->all([$object->object => $object->id]);
            $sessions = $stripe->checkout->sessions->all(['subscription' => $object->subscription]);
            if(count($sessions->data) > 0) {
                $metadata = $sessions->data[0]->metadata;
                if(array_key_exists('place_id',$metadata->toArray())) { //перехідна умова. Для прод можна видалити, залишивши тільки else
                    $place = Place::find($metadata->place_id);
                    $organization_id = $place->organization_id;
                }else{
                    $organization_id = $metadata->organization_id;
                }
                $duration = $metadata->duration;
                $product_name = $metadata->name;
                $tax_number = $metadata->tax_number;

                $stripe->customers->update($customer_id, [
                    'metadata' => [
                        'organization_id' => $organization_id,
                        'duration' => $duration,
                        'product_name' => $product_name,
                        'tax_number' => $tax_number
                    ]
                ]);
            }else{
                $customer = $stripe->customers->retrieve($customer_id);
                if(array_key_exists('place_id',$customer->metadata->toArray())) {//перехідна умова. Для прод можна видалити, залишивши тільки else
                    $place = Place::find($customer->metadata->place_id);
                    $organization_id = $place->organization_id;
                    $duration = $customer->metadata->duration;
                    $product_name = $customer->metadata->product_name;
                }elseif(array_key_exists('organization_id',$customer->metadata->toArray())) {
                    $organization_id = $customer->metadata->organization_id;
                    $duration = $customer->metadata->duration;
                    $product_name = $customer->metadata->product_name;
                }
            }
            if($organization_id){
                PaidBill::create([
                    'organization_id' => $organization_id,
                    'amount' => $object->amount_paid / 100,
                    'currency' => strtoupper($object->currency),
                    'payment_date' => \Carbon\Carbon::now()->timestamp($object->created),
                    'product_name' => $product_name,
                    'duration' => $duration,
                    'expired_at' => \Carbon\Carbon::now()->addMonths($duration),
                    'payment_intent_id' => $object->id,
                    'receipt_url' => $object->hosted_invoice_url
                ]);
            }
        }
        return response()->json(['result'=> 'OK']);
    }
}
