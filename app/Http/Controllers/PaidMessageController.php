<?php

namespace App\Http\Controllers;

use App\Models\PaidMessage;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Stripe\StripeClient;
use Stripe\Webhook;

class PaidMessageController extends Controller
{
    public function getAllByPlace($place_id,Request $request)
    {
        Validator::make([
            'place_id' => $place_id
        ],[
            'place_id' => 'required|exists:places,id'
        ])->validate();

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $paid_messages = PaidMessage::where('place_id',$place_id)
            ->orderBy('payment_date','desc')
            ->get();

        return response()->json($paid_messages);
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

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $stripe = new StripeClient(env('STRIPE_SECRET'));
        $price = $stripe->prices->retrieve($request->price_id);
        $product = $stripe->products->retrieve($price->product);
        $quantity = preg_replace( '/[^0-9]/', '', $product->name);

        $place = Place::find($request->place_id);

        $payment_link_data = [
            'line_items' => [['price' => $request->price_id, 'quantity' => 1]],
            'metadata' => [
                'place_id' => $place->id,
                'quantity' => $quantity,
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

        $link = $stripe->paymentLinks->create($payment_link_data);

        return response()->json(['url'=> $link->url]);
    }

    public function payTrial($place_id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($place_id);
        $trial_messages = $place->paid_mesasges()->where('product_name','Trial')->first();

        if($trial_messages){
            return response()->json([
                'message' => 'Trial has already been used'
            ], 400);
        }

        PaidMessage::create([
            'place_id' => $place->id,
            'amount' => 0,
            'currency' => 'DKK',
            'payment_date' => \Carbon\Carbon::now(),
            'product_name' => 'Trial',
            'quantity' => 100,
            'payment_intent_id' => '',
            'receipt_url' => ''
        ]);

        $place->increase_sms_limit(100);

        return response()->json(['result'=> 'OK']);
    }
}
