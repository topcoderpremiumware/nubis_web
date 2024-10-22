<?php

namespace App\Jobs;

use App\Models\Check;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SignCheck implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $check_id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($check_id)
    {
       $this->check_id = $check_id;
    }

    /**
     * @return void
     */
    public function handle()
    {
       $check = Check::find($this->check_id);
       $this->getSignatureData($check);
       $this->signData($check);

       $check->saveQuietly();
    }

    private function getSignatureData(Check &$check): void
    {
        if($check->place_check_id == 1){
            $prev_signature = 0;
        }else{
            $prev_check = Check::where('place_check_id', $check->place_check_id - 1)->first();
            if($prev_check){
                $prev_signature = $prev_check->signature;
            }else{
                Log::error('SignCheck::getSignatureData $prev_check is not exist',['$check_id' => $this->check_id]);
                $prev_signature = 0;
            }
        }

        if($check->payment_method == 'card'){
            $payment_method = 'CARDSAL';
        }elseif($check->payment_method == 'cash'){
            $payment_method = 'CASHSAL';
        }else{
            $payment_method = 'MIXEDSAL';
        }

        $vat = 0;
        foreach ($check->products as $product) {
            $p_total = (float)$product->pivot->price * (float)$product->pivot->quantity;
            if($check->discount){
                if(str_contains($check->discount_type,'percent')){
                    $p_discount = $p_total * $check->discount / 100;
                }else{
                    $p_discount = $p_total * $check->discount / $check->subtotal;
                }
                $p_total = $p_total - $p_discount;
            }

            $vat += $p_total - $p_total / (1 + $product->tax / 100);
        }

        $check->signature_data = implode(';', [
            $prev_signature,
            $check->place_check_id,
            $check->place_check_id,
            $payment_method,
            $check->printed_at->format('Y-m-d'),
            $check->printed_at->format('H:i:s'),
            $check->printed_id,
            number_format($check->total,2, '.', ''),
            number_format($check->total - $vat,2, '.', ''),
            'Nubis-'.$check->place_id,
            $check->place->tax_number
        ]);
    }

    private function signData(Check &$check): void
    {
        $filename = $check->place->setting('p12_key_file');
        $password = $check->place->setting('p12_password');

        if(!$filename){
            Log::info('SignCheck::signData filename not set',['filename' => $filename,'place' => $check->place_id]);
        }elseif(!Storage::disk('private')->exists($filename)){
            Log::info('SignCheck::signData file not exist',['filename' => $filename,'place' => $check->place_id]);
        }
        if(!$password) Log::info('SignCheck::signData password not set',['password' => $password,'place' => $check->place_id]);

        if($filename && $password && Storage::disk('private')->exists($filename)){
            $file_content = Storage::disk('private')->get($filename);
            $result = openssl_pkcs12_read($file_content, $certs, Crypt::decryptString($password));
            Log::info('SignCheck::signData read key',['$result' => $result,'place' => $check->place_id]);
            if($result){
                $privateKey = openssl_pkey_get_private($certs['pkey']);
                $publicKey = openssl_pkey_get_public($certs['cert']);

                openssl_sign($check->signature_data, $signature, $privateKey, OPENSSL_ALGO_SHA512);
                $certData = openssl_x509_parse($certs['cert']);

                $check->signature = base64_encode($signature);
                $check->key_version = $certData['version'];

                $isValid = openssl_verify($check->signature_data, base64_decode($check->signature), $publicKey, OPENSSL_ALGO_SHA512);
                if ($isValid === 1) {
                    Log::info('SignCheck::signData Sign is correct for place #'.$check->place_id);
                } elseif ($isValid === 0) {
                    Log::error('SignCheck::signData Sign is invalid for place #'.$check->place_id);
                } else {
                    Log::error('SignCheck::signData Sign verification error for place #'.$check->place_id);
                }
            }else{
                Log::error('SignCheck::signData key is wrong');
            }
        }
    }
}
