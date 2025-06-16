<?php

namespace App\Jobs\Verifone;

use App\Events\TerminalAborted;
use App\Events\TerminalError;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifoneAbort implements ShouldQueue
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

        $abort_data = $vg->abort($this->check_id);
        Log::info('VerifoneAbort::handle',['$abort_data' => $abort_data]);
        if($abort_data){
            // TODO: make something with check about aborting
            event(new TerminalAborted($this->terminal_id,'The payment has been aborted by the terminal'));
        }else{
            event(new TerminalError($this->terminal_id, 'Unknown abort error'));
        }
    }
}
