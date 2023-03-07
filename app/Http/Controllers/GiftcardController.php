<?php

namespace App\Http\Controllers;

use App\Models\Giftcard;
use App\Models\Log;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\StripeClient;

class GiftcardController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'expired_at' => 'required|date_format:Y-m-d H:i:s',
            'initial_amount' => 'required|numeric',
            'email' => 'required|email',
        ]);

        $giftcard = Giftcard::create([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'expired_at' => $request->expired_at,
            'initial_amount' => $request->initial_amount,
            'spend_amount' => $request->spend_amount ?? 0,
            'code' => str()->random(6),
            'email' => $request->email,
            'receiver_name' => $request->receiver_name ?? '',
            'receiver_email' => $request->receiver_email ?? '',
            'company_name' => $request->company_name,
            'company_address' => $request->company_address,
            'post_code' => $request->post_code,
            'company_city' => $request->company_city,
            'vat_number' => $request->vat_number,
            'country_id' => $request->country_id,
            'status' => 'pending'
        ]);

        $place = Place::find($request->place_id);

        $online_payment_currency = $place->setting('online-payment-currency');
        $stripe_secret = $place->setting('stripe-secret');
        $stripe_webhook_secret = $place->setting('stripe-webhook-secret');

        if(empty($online_payment_currency)){
            return response()->json([
                'message' => 'Payment currency settings is not set'
            ], 400);
        }
        if(empty($stripe_secret) || empty($stripe_webhook_secret)){
            return response()->json([
                'message' => 'Stripe settings is not set'
            ], 400);
        }

        if($stripe_secret && $stripe_webhook_secret && $online_payment_currency){
            $stripe = new StripeClient($stripe_secret);
            $price = $stripe->prices->create([
                'unit_amount' => $request->initial_amount * 100,
                'currency' => $online_payment_currency,
                'product_data' => [
                    'name' => 'Giftcard'
                ]
            ]);

            $link = $stripe->paymentLinks->create(
                [
                    'line_items' => [['price' => $price->id, 'quantity' => 1]],
                    'metadata' => [
                        'giftcard_id' => $giftcard->id
                    ],
                    'after_completion' => [
                        'type' => 'redirect',
                        'redirect' => ['url' => env('APP_URL')],
                    ],
                ]
            );
            $giftcard->payment_url = $link->url;
        }

        //Log::add($request,'create-giftcard','Created giftcard #'.$giftcard->id);

        return response()->json($giftcard);
    }

    public function createAdmin(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'expired_at' => 'required|date_format:Y-m-d H:i:s',
            'initial_amount' => 'required|numeric',
            'email' => 'required|email',
        ]);

        $giftcard = Giftcard::create([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'expired_at' => $request->expired_at,
            'initial_amount' => $request->initial_amount,
            'spend_amount' => $request->spend_amount ?? 0,
            'code' => str()->random(6),
            'email' => $request->email,
            'receiver_name' => $request->receiver_name ?? '',
            'receiver_email' => $request->receiver_email ?? '',
            'company_name' => $request->company_name,
            'company_address' => $request->company_address,
            'post_code' => $request->post_code,
            'company_city' => $request->company_city,
            'vat_number' => $request->vat_number,
            'country_id' => $request->country_id,
            'status' => 'confirmed'
        ]);

        $place = Place::find($request->place_id);
        $currency = $place->setting('online-payment-currency');

        $text = 'The '.$request->initial_amount.' '.$currency.' giftcard of '.$place->name.' was created. It can be used by specifying the code: '.$giftcard->code.'. The restaurant is located at '.$place->address.', '.$place->city.', '.$place->country->name.'. '.$place->home_page;
        \Illuminate\Support\Facades\Mail::html($text, function($msg) use ($request) {
            $msg->to($request->email)->subject('Giftcard');
        });
        if($request->has('receiver_email') && $request->receiver_email){
            \Illuminate\Support\Facades\Mail::html($text, function($msg) use ($request) {
                $msg->to($request->receiver_email)->subject('Giftcard');
            });
        }

        Log::add($request,'create-giftcard','Created giftcard #'.$giftcard->id);

        return response()->json($giftcard);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'expired_at' => 'required|date_format:Y-m-d H:i:s',
            'initial_amount' => 'required|numeric',
            'email' => 'required|email',
        ]);

        $giftcard = Giftcard::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($giftcard->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $giftcard->update([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'expired_at' => $request->expired_at,
            'initial_amount' => $request->initial_amount,
            'spend_amount' => $request->spend_amount ?? 0,
            'email' => $request->email,
            'receiver_name' => $request->receiver_name,
            'receiver_email' => $request->receiver_email,
            'company_name' => $request->company_name,
            'company_address' => $request->company_address,
            'post_code' => $request->post_code,
            'company_city' => $request->company_city,
            'vat_number' => $request->vat_number,
            'country_id' => $request->country_id,
            'status' => $request->status
        ]);

        Log::add($request,'change-giftcard','Changed giftcard #'.$giftcard->id);

        if($res){
            $giftcard = Giftcard::find($id);
            return response()->json($giftcard);
        }else{
            return response()->json(['message' => 'Giftcard not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $giftcard = Giftcard::find($id);

        if(!Auth::user()->places->contains($giftcard->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($giftcard);
    }

    public function getAllByPlace(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $giftcards = Giftcard::where('place_id',$request->place_id)
            ->get();

        return response()->json($giftcards);
    }

    public function getByCode(Request $request)
    {
        $request->validate([
            'code' => 'required',
        ]);

        $giftcard = Giftcard::where('code',$request->code)
            ->first();

        if($giftcard === null){
            return response()->json(['message' => 'Code is wrong'], 400);
        }
        if($giftcard->expired_at <= now()){
            return response()->json(['message' => 'Giftcard is expired'], 400);
        }
        if($giftcard->status != 'confirmed'){
            return response()->json(['message' => 'Giftcard is pending'], 400);
        }

        return response()->json($giftcard);
    }

    public function spend(Request $request)
    {
        $request->validate([
            'code' => 'required',
            'amount' => 'required|numeric'
        ]);

        $giftcard = Giftcard::where('code',$request->code)
            ->first();
        if($giftcard === null){
            return response()->json(['message' => 'Code is wrong'], 400);
        }
        if($giftcard->expired_at <= now()){
            return response()->json(['message' => 'Giftcard is expired'], 400);
        }
        if($giftcard->status != 'confirmed'){
            return response()->json(['message' => 'Giftcard is pending'], 400);
        }

        if(!$giftcard->spend($request->amount)){
            return response()->json(['message' => 'Giftcard has not enough amount'], 400);
        }

        //Log::add($request,'spend-giftcard','Spent giftcard #'.$giftcard->id.' by '.$request->amount);

        $giftcard = Giftcard::find($giftcard->id);

        return response()->json($giftcard);
    }
}
