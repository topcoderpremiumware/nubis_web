<?php

namespace App\Jobs;

use App\Events\TerminalError;
use App\Events\TerminalPaid;
use App\Models\Check;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SwedbankPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $amount;
    private $check_id;
    private $user_id;
    private $terminal_id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($amount,$check_id,$terminal_id,$user_id)
    {
       $this->amount = round($amount,2);
       $this->check_id = $check_id;
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
        $sg = new \App\Gateways\SwedbankGateway($this->user_id,$this->terminal_id);

        $pay_data = $sg->pay($this->amount,$this->check_id);
        Log::info('SwedbankPayment::handle',['$pay_data' => $pay_data]);
        if($pay_data){
            // 'Success' | 'Failure'
            $result = $pay_data['PaymentResponse']['Response']['@attributes']['Result'];
            if($result === 'Success'){
                $receipt_text = '';
                foreach ($pay_data['PaymentResponse']['PaymentReceipt'] as $PaymentReceipt) {
                    Log::info('SwedbankPayment::handle',[
                        $PaymentReceipt['@attributes']['DocumentQualifier'] => base64_decode($PaymentReceipt['OutputContent']['OutputText'])
                    ]);
                    if($PaymentReceipt['@attributes']['DocumentQualifier'] === 'CustomerReceipt'){
                        $receipt_text = json_decode(base64_decode($PaymentReceipt['OutputContent']['OutputText']),true);
                        $check = Check::find($this->check_id);
                        $check->bank_log = $receipt_text;
                        $check->save();
                        event(new TerminalPaid($this->terminal_id,'The order has been paid by the terminal'));
                    }
                }
            }else{
                // 'Cancel' | 'Refusal' | 'NotAllowed'
                $condition = $pay_data['PaymentResponse']['Response']['@attributes']['ErrorCondition'];
                switch ($condition){
                    case 'Cancel':
                        event(new TerminalError($this->terminal_id,'The payment was cancelled'));
                        break;
                    case 'Refusal':
                        event(new TerminalError($this->terminal_id,'The payment was refused'));
                        break;
                    case 'NotAllowed':
                        event(new TerminalError($this->terminal_id,'The payment was not allowed without auth'));
                        break;
                    case 'Aborted':
                        event(new TerminalError($this->terminal_id,'The payment was aborted'));
                        break;
                    default:
                        event(new TerminalError($this->terminal_id, 'Unknown payment error: '.$condition));
                }
            }
        }else{
            event(new TerminalError($this->terminal_id, 'Unknown payment error'));
        }
    }
}
