<?php

namespace App\Jobs\Verifone;

use App\Events\TerminalError;
use App\Events\TerminalPaid;
use App\Models\Check;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifoneRefund implements ShouldQueue
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
        $vg = new \App\Gateways\VerifoneGateway($this->user_id,$this->terminal_id);

        $refund_data = $vg->pay($this->amount,$this->check_id,'Refund');
        Log::info('VerifoneRefund::handle',['$refund_data' => $refund_data]);
        if($refund_data){
            // 'Success' | 'Failure'
            if($refund_data['PaymentResponse']['Response']['Result'] === 'SUCCESS'){
                $PaymentReceipt = $refund_data['PaymentResponse']['PaymentReceipt'];
                $check = Check::find($this->check_id);
                $check->bank_log = $PaymentReceipt['OutputContent']['OutputText'];
                $check->save();
                event(new TerminalPaid($this->terminal_id,'The order has been refund by the terminal'));
            }else{
                // 'Cancel' | 'Refusal' | 'NotAllowed'
                $condition = $refund_data['PaymentResponse']['Response']['ErrorCondition'];
                switch ($condition){
                    case 'CANCEL':
                        event(new TerminalError($this->terminal_id,'The payment was cancelled'));
                        break;
                    case 'REFUSAL':
                        event(new TerminalError($this->terminal_id,'The payment was refused'));
                        break;
                    case 'NOT_ALLOWED':
                        event(new TerminalError($this->terminal_id,'The payment was not allowed without auth'));
                        break;
                    case 'ABORTED':
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
