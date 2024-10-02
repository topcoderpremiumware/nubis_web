<?php

namespace App\Http\Controllers;

use App\Gateways\SwedbankGateway;
use App\Jobs\SwedbankTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class SwedbankWebhookController extends Controller
{
    public function webhook()
    {
        $request = @file_get_contents('php://input');
        Log::info('SwedbankWebhookController::webhook',['input' => $request]);

        $data = json_decode(json_encode(simplexml_load_string($request)),true);
        $poiid = $data['MessageHeader']['@attributes']['POIID'];
        $user_id = (int)$data['MessageHeader']['@attributes']['SaleID'];
        $place_id = (int)explode('-',$poiid)[1];
        $terminal_id = (int)explode('-',$poiid)[2];

        if($data['MessageHeader']['@attributes']['MessageCategory'] === 'Display'){
            $display = $data['DisplayRequest']['DisplayOutput']['OutputContent']['OutputText'];
            $code = explode(',',$display)[0];
            if(in_array($code,[9202,202])){ // OK
//                dispatch(new SwedbankTransaction($place_id,$terminal_id,$user_id));
            }
        }

        return response()->json(['result'=> 'OK'],204);
    }
}
