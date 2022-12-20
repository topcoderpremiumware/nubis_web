<?php

namespace App\Http\Controllers;

use App\Models\Giftcard;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GiftcardController extends Controller
{
    public function create(Request $request)
    {
//        if(!Auth::user()->tokenCan('admin')) return response()->json([
//            'message' => 'Unauthorized.'
//        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'expired_at' => 'required|date_format:Y-m-d H:i:s',
            'initial_amount' => 'required|numeric',
            'email' => 'required|email',
            'receiver_name' => 'required',
            'receiver_email' => 'required'
        ]);

        $giftcard = Giftcard::create([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'expired_at' => $request->expired_at,
            'initial_amount' => $request->initial_amount,
            'spend_amount' => $request->spend_amount ?? 0,
            'code' => str()->random(6),
            'email' => $request->email,
            'receiver_name' => $request->receiver_name,
            'receiver_email' => $request->receiver_email,
            'company_name' => $request->company_name,
            'company_address' => $request->company_address,
            'post_code' => $request->post_code,
            'company_city' => $request->company_city,
            'vat_number' => $request->vat_number,
            'country_id' => $request->country_id
        ]);

        Log::add($request,'create-giftcard','Created giftcard #'.$giftcard->id);

        return response()->json($giftcard);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'expired_at' => 'required|date_format:Y-m-d H:i:s',
            'initial_amount' => 'required|numeric',
            'email' => 'required|email',
            'receiver_name' => 'required',
            'receiver_email' => 'required'
        ]);

        $giftcard = Giftcard::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($giftcard->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $giftcard->update([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'expired_at' => $request->expired_at,
            'initial_amount' => $request->initial_amount,
            'spend_amount' => $request->spend_amount ?? 0,
            'email' => $request->email,
            'receiver_name' => $request->receiver_name,
            'receiver_email' => $request->receiver_email,
            'company_name' => $request->company_name,
            'company_address' => $request->company_address,
            'post_code' => $request->post_code,
            'company_city' => $request->company_city,
            'vat_number' => $request->vat_number,
            'country_id' => $request->country_id
        ]);

        Log::add($request,'change-giftcard','Changed giftcard #'.$giftcard->id);

        if($res){
            $giftcard = Giftcard::find($id);
            return response()->json($giftcard);
        }else{
            return response()->json(['message' => 'Giftcard not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $giftcard = Giftcard::find($id);

        if(!Auth::user()->places->contains($giftcard->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($giftcard);
    }

    public function getAllByPlace(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $giftcards = Giftcard::where('place_id',$request->place_id)
            ->get();

        return response()->json($giftcards);
    }

    public function getByCode(Request $request)
    {
        $request->validate([
            'code' => 'required',
        ]);

        $giftcard = Giftcard::where('code',$request->code)
            ->first();

        if($giftcard === null){
            return response()->json(['message' => 'Code is wrong'], 400);
        }
        if($giftcard->expired_at <= now()){
            return response()->json(['message' => 'Giftcard is expired'], 400);
        }

        return response()->json($giftcard);
    }

    public function spend(Request $request)
    {
        $request->validate([
            'code' => 'required',
            'amount' => 'required|numeric'
        ]);

        $giftcard = Giftcard::where('code',$request->code)
            ->first();
        if($giftcard === null){
            return response()->json(['message' => 'Code is wrong'], 400);
        }
        if($giftcard->expired_at <= now()){
            return response()->json(['message' => 'Giftcard is expired'], 400);
        }

        if(!$giftcard->spend($request->amount)){
            return response()->json(['message' => 'Giftcard has not enough amount'], 400);
        }

        Log::add($request,'spend-giftcard','Spent giftcard #'.$giftcard->id.' by '.$request->amount);

        $giftcard = Giftcard::find($giftcard->id);

        return response()->json($giftcard);
    }
}
