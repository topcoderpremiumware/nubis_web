<?php

namespace App\Jobs\Swedbank;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SwedbankTransaction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $place_id;
    private $user_id;
    private $terminal_id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($place_id,$terminal_id,$user_id)
    {
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
        $trans_data = $sg->getTransaction();
        Log::info('SwedbankTransaction::handle',['$trans_data' => $trans_data]);
        if($trans_data){
            // 'Success' | 'Failure'
            $result = $trans_data['TransactionStatusResponse']['Response']['@attributes']['Result'];
            $order_id = $trans_data['SaleData']['SaleTransactionID']['@attributes']['TransactionID'];
            if($result !== 'Success'){
                // 'Cancel' | 'Refusal'
                $condition = $trans_data['TransactionStatusResponse']['Response']['@attributes']['ErrorCondition'];
            }
        }
    }
}
