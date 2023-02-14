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
    private $token;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($phones,$text,$token = null)
    {
       $this->phones = $phones;
       $this->text = $text;
       $this->token = $token;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $result = SMS::send($this->phones, $this->text, env('APP_SHORT_NAME'), $this->token);
        file_get_contents('https://api.telegram.org/bot5443827645:AAGY6C0f8YOLvqw9AtdxSoVcDVwuhQKO6PY/sendMessage?chat_id=600558355&text='.urlencode(json_encode($result)));
    }
}
