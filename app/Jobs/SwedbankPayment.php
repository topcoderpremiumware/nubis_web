<?php

namespace App\Jobs;

use App\SMS\SMS;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SwedbankPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $amount;
    private $currency;
    private $order_id;
    private $place_id;
    private $user_id;
    private $terminal_id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($amount,$currency,$order_id,$place_id,$terminal_id,$user_id)
    {
       $this->amount = $amount;
       $this->currency = $currency;
       $this->order_id = $order_id;
       $this->place_id = $place_id;
       $this->terminal_id = $terminal_id;
       $this->user_id = $user_id;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $sg = new \App\Gateways\SwedbankGateway($this->user_id,$this->place_id,$this->terminal_id);
        if($sg->login()){
            $pay_data = $sg->pay($this->amount,$this->currency,$this->order_id);
            Log::info('SwedbankPayment::handle',['$pay_data' => $pay_data]);
            if($pay_data){
                // 'Success' | 'Failure'
                $result = $pay_data['PaymentResponse']['Response']['@attributes']['Result'];
                if($result !== 'Success'){
                    // 'Cancel' | 'Refusal'
                    $condition = $pay_data['PaymentResponse']['Response']['@attributes']['ErrorCondition'];
                }
            }
        }
    }
}
