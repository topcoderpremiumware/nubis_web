<?php

namespace App\Http\Controllers;

use App\Events\FromClient;
use App\Jobs\Swedbank\SwedbankAbort;
use App\Jobs\Swedbank\SwedbankInput;
use App\Jobs\Swedbank\SwedbankPayment;
use App\Jobs\Swedbank\SwedbankRefund;
use App\Jobs\Swedbank\SwedbankRevert;
use App\Jobs\Verifone\VerifoneAbort;
use App\Jobs\Verifone\VerifonePayment;
use App\Jobs\Verifone\VerifonePrint;
use App\Jobs\Verifone\VerifoneRefund;
use App\Jobs\Verifone\VerifoneRevert;
use App\Models\Log;
use App\Models\Place;
use App\Models\Terminal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TerminalController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'serial' => 'required',
            'name' => 'required',
            'provider' => 'required',
            'place_id' => 'required|exists:places,id'
        ]);

        if($request->provider === 'swedbank' && !$request->url) abort(400, 'Url is mandatory');
        if($request->provider === 'verifone' && !$request->user) abort(400, 'User ID is mandatory');
        if($request->provider === 'verifone' && !$request->password) abort(400, 'API Key is mandatory');

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($request->place_id);
        $terminal = Terminal::create([
            'serial' => $request->serial,
            'place_id' => $request->place_id,
            'url' => $request->url ?? '',
            'currency' => $place->setting('online-payment-currency'),
            'name' => $request->name,
            'provider' => $request->provider,
            'user' => $request->user,
            'password' => $request->password
        ]);

        Log::add($request,'create-terminal','Created terminal #'.$terminal->id);

        return response()->json($terminal);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'serial' => 'required',
            'name' => 'required',
            'provider' => 'required',
            'place_id' => 'required|exists:places,id'
        ]);

        if($request->provider === 'swedbank' && !$request->url) abort(400, 'Url is mandatory');
        if($request->provider === 'verifone' && !$request->user) abort(400, 'User ID is mandatory');
        if($request->provider === 'verifone' && !$request->password) abort(400, 'API Key is mandatory');

        $terminal = Terminal::find($id);

        if(!Auth::user()->is_superadmin && (!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($terminal->place_id))){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $terminal->update([
            'serial' => $request->serial,
            'place_id' => $request->place_id,
            'url' => $request->url ?? '',
            'currency' => $terminal->place->setting('online-payment-currency'),
            'name' => $request->name,
            'provider' => $request->provider,
            'user' => $request->user,
            'password' => $request->password
        ]);

        Log::add($request,'change-terminal','Changed terminal #'.$id);

        if($res){
            $terminal = Terminal::find($id);
            return response()->json($terminal);
        }else{
            return response()->json(['message' => 'Terminal not updated'],400);
        }
    }

    public function getAllByPlace($place_id, Request $request)
    {
        $terminals = Terminal::where('place_id',$place_id)
            ->get();

        return response()->json($terminals);
    }

    public function delete($id, Request $request)
    {
        $terminal = Terminal::find($id);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($terminal->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'delete-terminal','Deleted terminal #'.$terminal->id);

        $terminal->delete();

        return response()->json(['message' => 'Terminal is deleted']);
    }

    public function sendPayment($id, Request $request)
    {
        $request->validate([
            'amount' => 'required',
            'check_id' => 'required'
        ]);
        $terminal = Terminal::find($id);
        if($terminal->provider === 'swedbank'){
            dispatch(new SwedbankPayment($request->amount, $request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }elseif($terminal->provider === 'verifone'){
            dispatch(new VerifonePayment($request->amount, $request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }
        return response()->json(['message' => 'The payment has been sent to the terminal']);
    }

    public function sendRefund($id, Request $request)
    {
        $request->validate([
            'amount' => 'required',
            'check_id' => 'required'
        ]);
        $terminal = Terminal::find($id);
        if($terminal->provider === 'swedbank'){
            dispatch(new SwedbankRefund($request->amount, $request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }elseif($terminal->provider === 'verifone'){
            dispatch(new VerifoneRefund($request->amount, $request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }
        return response()->json(['message' => 'The refund has been sent to the terminal']);
    }

    public function sendRevert($id, Request $request)
    {
        $request->validate([
            'check_id' => 'required'
        ]);
        $terminal = Terminal::find($id);
        if($terminal->provider === 'swedbank'){
            dispatch(new SwedbankRevert($request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }elseif($terminal->provider === 'verifone'){
            dispatch(new VerifoneRevert($request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }
        return response()->json(['message' => 'The revert has been sent to the terminal']);
    }

    public function sendAbort($id, Request $request)
    {
        $request->validate([
            'check_id' => 'required'
        ]);
        $terminal = Terminal::find($id);
        if($terminal->provider === 'swedbank'){
            dispatch(new SwedbankAbort($request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }elseif($terminal->provider === 'verifone'){
            dispatch(new VerifoneAbort($request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }
        return response()->json(['message' => 'The abort has been sent to the terminal']);
    }

    public function sendInput($id, Request $request)
    {
        $request->validate([
            'check_id' => 'required',
            'value' => 'required'
        ]);
        $terminal = Terminal::find($id);
        if($terminal->provider === 'swedbank'){
            dispatch(new SwedbankInput($request->value,$request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        }
        return response()->json(['message' => 'The input has been sent to the terminal']);
    }

    public function sendPrint($id, Request $request)
    {
        $request->validate([
            'text' => 'required',
        ]);
        $terminal = Terminal::find($id);
        if($terminal->provider === 'verifone'){
            dispatch(new VerifonePrint($request->text, $id, Auth::user()->id))->onQueue('terminal');
        }
        return response()->json(['message' => 'The print has been sent to the terminal']);
    }

    public function sendFromClient(Request $request)
    {
        event(new FromClient($request->channel, $request->event, $request->data));
        return response()->json(['message' => 'The message has been sent to the clients']);
    }
}
