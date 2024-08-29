<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Check;
use App\Models\Log;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CheckController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'order_id' => 'required|exists:orders,id',
            'status' => 'required',
            'total' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        $check = Check::create([
            'place_id' => $request->place_id,
            'order_id' => $request->order_id,
            'status' => $request->status,
            'total' => $request->total,
            'discount' => $request->discount,
            'discount_type' => $request->discount_type,
            'discount_code' => $request->discount_code
        ]);

        if($request->has('products')){
            $sync_array = [];
            foreach ($request->products as $product) {
                $sync_array[$product['id']] = [
                    'price' => $product['pivot']['price'],
                    'quantity' => $product['pivot']['quantity']
                ];
            }
            $check->products()->sync($sync_array);
        }

        Log::add($request,'create-check','Created check #'.$check->id);

        return response()->json($check);
    }

    public function save($id, Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'order_id' => 'required|exists:orders,id',
            'status' => 'required',
            'total' => 'required'
        ]);

        $check = Check::find($id);
        if($check->status == 'closed') abort(400, 'This cart is closed');

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($check->place_id)) abort(400, 'It\'s not your place');

        $res = $check->update([
            'place_id' => $request->place_id,
            'order_id' => $request->order_id,
            'status' => $request->status,
            'total' => $request->total,
            'discount' => $request->discount,
            'discount_type' => $request->discount_type,
            'discount_code' => $request->discount_code
        ]);

        if($request->has('products')){
            $sync_array = [];
            foreach ($request->products as $product) {
                $sync_array[$product['id']] = [
                    'price' => $product['pivot']['price'],
                    'quantity' => $product['pivot']['quantity']
                ];
            }
            $check->products()->sync($sync_array);
        }

        Log::add($request,'change-check','Changed check #'.$id);

        if($res){
            $check = Check::find($id);
            return response()->json($check);
        }else{
            return response()->json(['message' => 'Product category not updated'],400);
        }
    }

    public function getAllByOrder($order_id, Request $request)
    {
        $checks = Check::with('products')
            ->where('order_id',$order_id)
            ->get();

        return response()->json($checks);
    }
}
