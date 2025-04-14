<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Log;
use App\Models\PaidBill;
use App\Models\PaidMessage;
use App\Models\Place;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Stripe\Invoice;
use Stripe\StripeClient;
use Stripe\Webhook;

class BillingController extends Controller
{
    public function getAllByPlace($place_id,Request $request)
    {
        Validator::make([
            'place_id' => $place_id
        ],[
            'place_id' => 'required|exists:places,id'
        ])->validate();

        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $billings = PaidBill::where('place_id',$place_id)
            ->orderBy('payment_date','desc')
            ->get();

        return response()->json($billings);
    }

    public function getActiveByPlace($place_id,Request $request)
    {
        Validator::make([
            'place_id' => $place_id
        ],[
            'place_id' => 'required|exists:places,id'
        ])->validate();

        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $billings = PaidBill::where('place_id',$place_id)
            ->where('expired_at','>',Carbon::now())
            ->pluck('category');

        return response()->json($billings);
    }

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
                'place_id' => $place->id,
                'duration' => $duration,
                'name' => $product->name,
                'tax_number' => $place->tax_number,
                'category' => $request->category
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
            'allow_promotion_codes' => true
        ];

        if($place->paid_bills()->where('product_name','!=','Trial')->count() === 0){
            $payment_link_data['subscription_data'] = ['trial_period_days' => 30];
        }

        $link = $stripe->paymentLinks->create($payment_link_data);

        return response()->json(['url'=> $link->url]);
    }

    public function getHelpInvoiceByPrice(Request $request)
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

        $place = Place::find($request->place_id);

        $payment_link_data = [
            'line_items' => [['price' => $request->price_id, 'quantity' => 1]],
            'metadata' => [
                'place_id' => $place->id,
                'help' => true,
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

        $link = $stripe->paymentLinks->create($payment_link_data);

        return response()->json(['url'=> $link->url]);
    }

    public function payTrial($place_id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        if(!Auth::user()->is_superadmin) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($place_id);
//        $trial_bill = $place->paid_bills()->where('product_name','Trial')->first();
//
//        if($trial_bill){
//            return response()->json([
//                'message' => 'Trial has already been used'
//            ], 400);
//        }

        $months_duration = 1;

        PaidBill::create([
            'place_id' => $place->id,
            'amount' => 0,
            'currency' => 'DKK',
            'payment_date' => \Carbon\Carbon::now(),
            'product_name' => 'Trial',
            'duration' => $months_duration,
            'expired_at' => \Carbon\Carbon::now()->addMonths($months_duration),
            'payment_intent_id' => '',
            'receipt_url' => '',
            'category' => 'full'
        ]);

        return response()->json(['result'=> 'OK']);
    }

    public function getLastActiveTrial($place_id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        if(!Auth::user()->is_superadmin) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($place_id);
        $trial_bill = $place->paid_bills()
            ->where('product_name','Trial')
            ->orderByDesc('expired_at')
            ->first();
        if(!$trial_bill || $trial_bill->expired_at < \Carbon\Carbon::now()) return response()->json(null);

        return response()->json($trial_bill);
    }

    public function delete($id, Request $request)
    {
        if(!Auth::user()->is_superadmin) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $bill = PaidBill::find($id);

        Log::add($request,'delete-bill','Deleted bill #'.$bill->id);

        $bill->delete();

        return response()->json(['message' => 'Bill is deleted']);
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
            $subscription_id = $object->lines->data[0]->subscription;
            $place_id = false;

//            $sessions = $stripe->checkout->sessions->all([$object->object => $object->id]);
            $sessions = $stripe->checkout->sessions->all(['subscription' => $object->subscription]);
            $category = null;
            if(count($sessions->data) > 0) {
                $metadata = $sessions->data[0]->metadata;
                if(array_key_exists('place_id',$metadata->toArray())) {
                    $duration = $metadata->duration;
                    $product_name = $metadata->name;
                    $tax_number = $metadata->tax_number;
                    $category = $metadata->category;
                    $place_id = $metadata->place_id;

                    $stripe->subscriptions->update($subscription_id, [
                        'metadata' => [
                            'place_id' => $place_id,
                            'duration' => $duration,
                            'product_name' => $product_name,
                            'tax_number' => $tax_number,
                            'category' => $category
                        ]
                    ]);
                }
            }else{
                $subscriptions = $stripe->subscriptions->retrieve($subscription_id);
                if(array_key_exists('place_id',$subscriptions->metadata->toArray())) {
                    $place_id = $subscriptions->metadata->place_id;
                    $duration = $subscriptions->metadata->duration;
                    $product_name = $subscriptions->metadata->product_name;
                    $category = $subscriptions->metadata->category;
                }
            }
            if($place_id){
                PaidBill::create([
                    'place_id' => $place_id,
                    'amount' => $object->amount_paid / 100,
                    'currency' => strtoupper($object->currency),
                    'payment_date' => \Carbon\Carbon::now()->timestamp($object->created),
                    'product_name' => $product_name,
                    'duration' => $duration,
                    'expired_at' => \Carbon\Carbon::now()->addMonths($duration),
                    'payment_intent_id' => $object->id,
                    'receipt_url' => $object->invoice_pdf,
                    'category' => $category ?? 'full'
                ]);
            }
        }

        if ($event->type == 'payment_intent.succeeded') {
            $stripe = new StripeClient(env('STRIPE_SECRET'));
            $object = $event->data->object;
            $place_id = false;

            $sessions = $stripe->checkout->sessions->all([$object->object => $object->id]);
            if(count($sessions->data) > 0){
                $metadata = $sessions->data[0]->metadata;
            }else{
                $metadata = $object->metadata;
            }

            if(array_key_exists('help',$metadata->toArray())){
                $tax_number = $metadata->tax_number;
                $place_id = $metadata->place_id;

                $place = Place::find($place_id);
                try{
                    \Illuminate\Support\Facades\Mail::html('The Place '.$place->name.' #'.$place_id.' paid you to help him', function ($msg) {
                        $msg->to('support@nubisreservation.com')->subject('Paid for help');
                    });
                }catch (\Exception $e){}
            }

            if(array_key_exists('quantity',$metadata->toArray())){
                $quantity = $metadata->quantity;
                $product_name = $metadata->name;
                $tax_number = $metadata->tax_number;
                $place_id = $metadata->place_id;

                $place = Place::find($place_id);

                PaidMessage::create([
                    'place_id' => $place_id,
                    'amount' => $object->amount / 100,
                    'currency' => strtoupper($object->currency),
                    'payment_date' => \Carbon\Carbon::now()->timestamp($object->created),
                    'product_name' => $product_name,
                    'quantity' => $quantity,
                    'payment_intent_id' => $object->id,
                    'receipt_url' => $object->charges->data[0]->receipt_url
                ]);

                $place->increase_sms_limit($quantity);
            }
        }

        return response()->json(['result'=> 'OK']);
    }

    public function getEditLink($id, Request $request): JsonResponse
    {
        $billing = PaidBill::find($id);
        if(!$billing->payment_intent_id) abort(400, 'Billing is not paid');

        $stripe = new StripeClient(env('STRIPE_SECRET'));
        /* @var Invoice $invoice */
        $invoice = $stripe->invoices->retrieve($billing->payment_intent_id);
        $customer_id = $invoice->customer;

        $configuration = $stripe->billingPortal->configurations->create([
            'features' => [
                'customer_update' => [
                    'allowed_updates' => ['email'],
                    'enabled' => true,
                ],
                'invoice_history' => ['enabled' => true],
                'payment_method_update' => ['enabled' => true],
                'subscription_cancel' => [
                    'enabled' => true,
                    'mode' => 'at_period_end',
                    'proration_behavior' => 'none',
                    'cancellation_reason' => [
                        'enabled' => true,
                        'options' => ['customer_service','low_quality','missing_features','other','switched_service','too_complex','too_expensive','unused']
                    ]
                ],
//                'subscription_update' => [
//                    'enabled' => true,
//                    'proration_behavior' => 'always_invoice',
//                    'default_allowed_updates' => ['quantity'],
//                    'products' => [
//                        [
//                            'prices' => [$invoice->lines->data[0]->price->id],
//                            'product' => $invoice->lines->data[0]->price->product
//                        ]
//                    ]
//                ]
            ],
        ]);

        $portal = $stripe->billingPortal->sessions->create([
            'customer' => $customer_id,
            'configuration' => $configuration->id,
            'return_url' => env('APP_URL').'/admin/billingReport',
        ]);

        return response()->json($portal->url);
    }
}
