<?php

namespace App\Http\Controllers;

use App\Events\TerminalDisplay;
use App\Events\TerminalPrintData;
use App\Models\Terminal;
use Illuminate\Support\Facades\Log;


class SwedbankWebhookController extends Controller
{
    public function webhook()
    {
        $request = @file_get_contents('php://input');
        Log::info('SwedbankWebhookController::webhook',['input' => $request]);

        $data = json_decode(json_encode(simplexml_load_string($request)),true);
        $poiid = $data['MessageHeader']['@attributes']['POIID'];

        if($data['MessageHeader']['@attributes']['MessageCategory'] === 'Display'){
            $display = $data['DisplayRequest']['DisplayOutput']['OutputContent']['OutputText'];
            $parts = explode(',',str_replace('"','',$display));
            $code = $parts[0];
            $message = implode(' ',array_slice($parts,1));
            $terminal = Terminal::where('serial',$poiid)->first();
            if($terminal){
                event(new TerminalDisplay($terminal->id,$code,$message));
                if(in_array($code,[9202,202])){ // OK
//                dispatch(new SwedbankTransaction($place_id,$terminal_id,$user_id));
                }
            }
        }

        if($data['MessageHeader']['@attributes']['MessageCategory'] === 'Print'){
            $terminal = Terminal::where('serial',$poiid)->first();
            $base64 = $data['PrintRequest']['PrintOutput']['OutputContent']['OutputText'];
            event(new TerminalPrintData($terminal->id,$base64));
        }

        if($data['MessageHeader']['@attributes']['MessageCategory'] !== 'Input') {
            return response()->json(['result' => 'OK'], 204);
        }
    }
}
