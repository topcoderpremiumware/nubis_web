<?php

namespace App\Jobs;


use App\Http\Controllers\OrderController;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;


class ForceOrderCompleted implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $orders = Order::whereIn('status',['waiting','pending','arrived','confirmed'])
            ->get();
        foreach ($orders as $order) {
            $order_to = $order->reservation_time->copy()->addMinutes($order->length);
            if($order_to->lt(Carbon::now())){
                OrderController::setOrderStatus($order,'completed');
            }
        }
    }
}
