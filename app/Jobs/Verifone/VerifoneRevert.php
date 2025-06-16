<?php

namespace App\Jobs\Verifone;

use App\Events\TerminalError;
use App\Events\TerminalReverted;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifoneRevert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $check_id;
    private $user_id;
    private $terminal_id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($check_id,$terminal_id,$user_id)
    {
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

        $revert_data = $vg->revert($this->check_id);
        Log::info('VerifoneRevert::handle',['$revert_data' => $revert_data]);
        if($revert_data){
            // TODO: make something with check about reverting
            event(new TerminalReverted($this->terminal_id,'The payment has been reverted by the terminal'));
        }else{
            event(new TerminalError($this->terminal_id, 'Unknown revert error'));
        }
    }
}
