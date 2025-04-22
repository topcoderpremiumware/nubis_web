<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CouponController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'expired_at' => 'required|date_format:Y-m-d H:i:s',
            'amount' => 'required|numeric',
        ]);

        $coupon = Coupon::create([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'expired_at' => $request->expired_at,
            'amount' => $request->amount,
            'code' => str()->random(6)
        ]);

        Log::add($request,'create-coupon','Created coupon #'.$coupon->id);

        return response()->json($coupon);
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
            'amount' => 'required|numeric',
        ]);

        $coupon = Coupon::find($id);

        if(!Auth::user()->is_superadmin && (!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($coupon->place_id))){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $coupon->update([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'expired_at' => $request->expired_at,
            'amount' => $request->amount,
        ]);

        Log::add($request,'change-coupon','Changed coupon #'.$coupon->id);

        if($res){
            $coupon = Coupon::find($id);
            return response()->json($coupon);
        }else{
            return response()->json(['message' => 'Coupon not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $coupon = Coupon::find($id);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($coupon->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($coupon);
    }

    public function getAllByPlace(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $coupons = Coupon::where('place_id',$request->place_id)
            ->get();

        return response()->json($coupons);
    }

    public function getByCode(Request $request)
    {
        $request->validate([
            'code' => 'required',
        ]);

        $coupon = Coupon::where('code',$request->code)
            ->first();

        if($coupon === null){
            return response()->json(['message' => 'Code is wrong'], 400);
        }
        if($coupon->expired_at <= now()){
            return response()->json(['message' => 'Coupon is expired'], 400);
        }

        return response()->json($coupon);
    }

    public function delete($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $coupon = Coupon::find($id);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($coupon->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'delete-coupon','Deleted coupon #'.$coupon->id);

        $coupon->delete();

        return response()->json(['message' => 'Order is deleted']);
    }
}
