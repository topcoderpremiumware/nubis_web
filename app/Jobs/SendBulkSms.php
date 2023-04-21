<?php

namespace App\Jobs;

use App\SMS\SMS;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendBulkSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $phones;
    private $text;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($phones,$text)
    {
       $this->phones = $phones;
       $this->text = $text;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $result = SMS::send($this->phones, $this->text, env('APP_SHORT_NAME'));
    }
}
