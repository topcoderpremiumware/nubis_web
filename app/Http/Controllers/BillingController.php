<?php

namespace App\Http\Controllers;

use App\Models\Log;
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
        $link = $stripe->paymentLinks->create(
            [
                'line_items' => [['price' => $request->price_id, 'quantity' => 1]], //price_1MED982eZvKYlo2CZLQdP554
                'metadata' => [
                    'place_id' => $request->place_id,
                    'type' => 'billing'
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
            file_get_contents('https://api.telegram.org/bot5443827645:AAGY6C0f8YOLvqw9AtdxSoVcDVwuhQKO6PY/sendMessage?chat_id=600558355&text='.urlencode('billing webhook header: '.json_encode($_SERVER['HTTP_STRIPE_SIGNATURE'])));
            $event = Webhook::constructEvent(
                $request->getContent(),
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
            // All the verification checks passed
            $verification_session = $event->data->object;
            file_get_contents('https://api.telegram.org/bot5443827645:AAGY6C0f8YOLvqw9AtdxSoVcDVwuhQKO6PY/sendMessage?chat_id=600558355&text='.urlencode('billing webhook payment_succeeded object: '.json_encode($verification_session)));
        }

        if ($event->type == 'payment_intent.succeeded') {
            // All the verification checks passed
            $verification_session = $event->data->object;
            file_get_contents('https://api.telegram.org/bot5443827645:AAGY6C0f8YOLvqw9AtdxSoVcDVwuhQKO6PY/sendMessage?chat_id=600558355&text='.urlencode('billing webhook payment_intent object: '.json_encode($verification_session)));
        }
        return response()->json(['result'=> 'OK']);
    }
}
