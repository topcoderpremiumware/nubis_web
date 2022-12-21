<?php

namespace App\Http\Middleware;

use App\Models\Place;
use Closure;

class BillPaid
{

    public function handle($request, Closure $next)
    {
        $place = Place::find($request->place_id);
        if(!$place || !$place->is_bill_paid()){
            return redirect()->route('home');
        }

        return $next($request);
    }
}
