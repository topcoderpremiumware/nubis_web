<?php

namespace App\Jobs\Verifone;

use App\Events\TerminalError;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifonePrint implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $text;
    private $user_id;
    private $terminal_id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($text,$terminal_id,$user_id)
    {
        $this->text = $text;
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

        $print_data = $vg->print($this->text);
        Log::info('VerifonePrint::handle',['$print_data' => $print_data]);
        if($print_data){
            // TODO: make something with check about print
        }else{
            event(new TerminalError($this->terminal_id, 'Unknown input error'));
        }
    }
}
