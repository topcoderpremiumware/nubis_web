<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\StripeClient;

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
}
