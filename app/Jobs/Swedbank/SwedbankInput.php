<?php

namespace App\Jobs\Swedbank;

use App\Events\TerminalError;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SwedbankInput implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $value;
    private $check_id;
    private $user_id;
    private $terminal_id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($value,$check_id,$terminal_id,$user_id)
    {
        $this->value = $value;
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

        $input_data = $sg->input($this->value);
        Log::info('SwedbankPayment::handle',['$input_data' => $input_data]);
        if($input_data){
            // TODO: make something with check about input
        }else{
            event(new TerminalError($this->terminal_id, 'Unknown input error'));
        }
    }
}
