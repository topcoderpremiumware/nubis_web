<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;

class OptionalAuth extends Middleware
{

    public function handle($request, Closure $next, ...$guards)
    {
        if ($request->user('user_api') || $request->user('customer_api')) {
            $this->authenticate($request, $guards);
        }


        return $next($request);
    }
}
