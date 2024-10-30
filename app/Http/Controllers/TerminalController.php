<?php

namespace App\Http\Controllers;

use App\Jobs\SwedbankPayment;
use App\Models\Area;
use App\Models\Log;
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

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $terminal = Terminal::create([
            'serial' => $request->serial,
            'place_id' => $request->place_id,
            'url' => $request->url
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

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($terminal->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $terminal->update([
            'serial' => $request->serial,
            'place_id' => $request->place_id,
            'url' => $request->url
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

        if(!Auth::user()->places->contains($terminal->place_id)){
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
            'order_id' => 'required'
        ]);

        dispatch(new SwedbankPayment($request->amount, $request->order_id, $id, Auth::user()->id));
        return response()->json(['message' => 'The payment has been sent to the terminal']);
    }
}
