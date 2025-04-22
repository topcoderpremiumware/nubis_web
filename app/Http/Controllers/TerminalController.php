<?php

namespace App\Http\Controllers;

use App\Events\FromClient;
use App\Jobs\SwedbankAbort;
use App\Jobs\SwedbankInput;
use App\Jobs\SwedbankPayment;
use App\Jobs\SwedbankRefund;
use App\Jobs\SwedbankRevert;
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
            'place_id' => 'required|exists:places,id',
            'url' => 'required',
        ]);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($request->place_id);
        $terminal = Terminal::create([
            'serial' => $request->serial,
            'place_id' => $request->place_id,
            'url' => $request->url,
            'currency' => $place->setting('online-payment-currency')
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
            'place_id' => 'required|exists:places,id',
            'url' => 'required'
        ]);

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
            'url' => $request->url,
            'currency' => $terminal->place->setting('online-payment-currency')
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

        dispatch(new SwedbankPayment($request->amount, $request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        return response()->json(['message' => 'The payment has been sent to the terminal']);
    }

    public function sendRefund($id, Request $request)
    {
        $request->validate([
            'amount' => 'required',
            'check_id' => 'required'
        ]);

        dispatch(new SwedbankRefund($request->amount, $request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        return response()->json(['message' => 'The refund has been sent to the terminal']);
    }

    public function sendRevert($id, Request $request)
    {
        $request->validate([
            'check_id' => 'required'
        ]);

        dispatch(new SwedbankRevert($request->check_id, $id, Auth::user()->id))->onQueue('terminal');
        return response()->json(['message' => 'The revert has been sent to the terminal']);
    }

    public function sendAbort($id, Request $request)
    {
        $request->validate([
            'check_id' => 'required'
        ]);

        dispatch(new SwedbankAbort($request->check_id, $id, Auth::user()->id));
        return response()->json(['message' => 'The abort has been sent to the terminal']);
    }

    public function sendInput($id, Request $request)
    {
        $request->validate([
            'check_id' => 'required',
            'value' => 'required'
        ]);

        dispatch(new SwedbankInput($request->value,$request->check_id, $id, Auth::user()->id));
        return response()->json(['message' => 'The abort has been sent to the terminal']);
    }

    public function sendFromClient(Request $request)
    {
        event(new FromClient($request->channel, $request->event, $request->data));
        return response()->json(['message' => 'The message has been sent to the clients']);
    }
}
