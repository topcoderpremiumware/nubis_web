<?php

namespace App\Http\Middleware;

use App\Models\Giftcard;
use App\Models\Order;
use App\Models\Place;
use Closure;
use Illuminate\Support\Facades\Auth;

class BillPaid
{
//->middleware('bill_paid:pos,pos_terminal')
    public function handle($request, Closure $next, ...$categories)
    {
        if(Auth::check() && Auth::user()->is_superadmin) return $next($request);

        $place = false;
        if($request->has('place_id') || $request->route('place_id')){
            $place_id = $request->route('place_id') ?? $request->place_id;
            $place = Place::find($place_id);
        }elseif($request->has('order_id') || $request->route('order_id')){
            $order_id = $request->route('order_id') ?? $request->order_id;
            $order = Order::find($order_id);
            $place = $order->place;
        }elseif($request->has('giftcard_id') || $request->route('giftcard_id')){
            $giftcard_id = $request->route('giftcard_id') ?? $request->giftcard_id;
            $giftcard = Giftcard::find($giftcard_id);
            $place = $giftcard->place;
        }

        if(!$place || (!$place->is_bill_paid($categories)
                && (!$request->has('s') || $request->s !== 'superadmin')
            )){
            return redirect()->route('home');
        }

        return $next($request);
    }
}
