<?php

namespace App\Http\Controllers;

use App\Models\Giftcard;
use App\Models\Log;
use App\Models\Place;
use Carbon\Carbon;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

        if($request->has('receiver_name')){
            if(is_array($request->receiver_name)){
                $receiver_name = implode(',',$request->receiver_name);
            }else{
                $receiver_name = $request->receiver_name;
            }
        }else{
            $receiver_name = '';
        }

        if($request->has('receiver_email')){
            if(is_array($request->receiver_email)) {
                $receiver_email = implode(',', $request->receiver_email);
            }else{
                $receiver_email = $request->receiver_email;
            }
        }else{
            $receiver_email = '';
        }

        $giftcard = Giftcard::create([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'expired_at' => $request->expired_at,
            'initial_amount' => $request->initial_amount,
            'spend_amount' => $request->spend_amount ?? 0,
            'code' => Giftcard::generateUniqueCode(),
            'email' => $request->email,
            'receiver_name' => $receiver_name,
            'receiver_email' => $receiver_email,
            'company_name' => $request->company_name,
            'company_address' => $request->company_address,
            'post_code' => $request->post_code,
            'company_city' => $request->company_city,
            'vat_number' => $request->vat_number,
            'country_id' => $request->country_id,
            'status' => 'pending',
            'giftcard_menu_id' => $request->experience_id,
            'greetings' => $request->greetings
        ]);

        if($request->has('background_image')){
            $bg_parts = explode(',',$request->background_image);
            preg_match('/^data:image\/(\w+);base64/', $bg_parts[0], $matches);
            $bg_ext = $matches[1];
            $background_image = 'giftcards/'.$giftcard->id.'_'.Carbon::now()->timestamp.'.'.$bg_ext;
            Storage::disk('public')->put($background_image, base64_decode($bg_parts[1]));

            $giftcard->background_image = $background_image;
            $giftcard->save();
        }

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
                        'redirect' => ['url' => env('APP_URL').'/thank-you/giftcard/'.$giftcard->code],
                    ],
                ]
            );
            $giftcard->payment_url = $link->url;
        }

        Log::add($request,'create-giftcard','Created giftcard #'.$giftcard->id);

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
            'code' => Giftcard::generateUniqueCode(),
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

        $html = view('pdfs.giftcard', compact('giftcard'))->render();
        $options = new Options();
        $options->set('enable_remote', TRUE);
        $options->set('enable_html5_parser', FALSE);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();

        $filename = 'giftcards/'.$giftcard->id.'_'.Carbon::now()->timestamp.'.pdf';
        Storage::disk('public')->put($filename, $dompdf->output());

        $giftcard->filename = $filename;
        $giftcard->save();
        try {
            \Illuminate\Support\Facades\Mail::html($text, function ($msg) use ($place, $dompdf, $request) {
                $msg->to($request->email)->subject('Giftcard');
                $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                $msg->attachData($dompdf->output(), 'giftcard.pdf');
            });
        }catch (\Exception $e){}
        if($request->has('receiver_email') && $request->receiver_email){
            try{
                \Illuminate\Support\Facades\Mail::html($text, function($msg) use ($place, $dompdf, $request) {
                    $msg->to($request->receiver_email)->subject('Giftcard');
                    $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                    $msg->attachData($dompdf->output(), 'giftcard.pdf');
                });
            }catch (\Exception $e){}
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
            ->orderBy('created_at','DESC')
            ->get();

        return response()->json($giftcards);
    }

    public function getByCode(Request $request)
    {
        $request->validate([
            'code' => 'required',
            'place_id' => 'required|exists:places,id',
        ]);

        $giftcard = Giftcard::where('code',$request->code)
            ->where('place_id',$request->place_id)
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

    public function pdfPreview(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id'
        ]);

        $giftcard = new Giftcard();
        $giftcard->place_id = $request->place_id;
        $giftcard->name = $request->name;
        $giftcard->expired_at = $request->expired_at;
        $giftcard->initial_amount = $request->initial_amount;
        $giftcard->receiver_name = $request->receiver_name ? implode(',',$request->receiver_name) : '';
        $giftcard->giftcard_menu_id = $request->experience_id;
        $giftcard->greetings = $request->greetings;
        $giftcard->bg_url = $request->background_image;
        $giftcard->examle = true;

        $html = view('pdfs.new_giftcard', compact('giftcard'))->render();
        $options = new Options();
        $options->set('enable_remote', TRUE);
        $options->set('enable_html5_parser', FALSE);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();
        $dompdf->stream('giftcard.pdf', array("Attachment" => false,'compress' => false));
    }
}
