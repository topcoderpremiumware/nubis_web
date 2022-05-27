<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'customer_id' => 'exists:customers,id',
            'place_id' => 'required|exists:places,id',
            'tableplan_id' => 'required|exists:tableplans,id',
            'area_id' => 'required|exists:areas,id',
            'table_ids' => 'required|array',
            'seats' => 'required|integer',
            'reservation_time' => 'required|date_format:Y-m-d H:i:s',
            'status' => 'required',
            'is_take_away' => 'required|boolean',
            'source' => 'required|in:online,internal'
        ]);

        $order = Order::create([
            'customer_id' => $request->customer_id,
            'place_id' => $request->place_id,
            'tableplan_id' => $request->tableplan_id,
            'area_id' => $request->area_id,
            'table_ids' => $request->table_ids,
            'seats' => $request->seats,
            'reservation_time' => $request->reservation_time,
            'comment' => $request->comment ?? '',
            'status' => $request->status,
            'is_take_away' => $request->is_take_away,
            'source' => $request->source,
            'marks' => ''
        ]);

        Log::add($request,'create-order','Created order #'.$order->id);

        return response()->json($order);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'customer_id' => 'exists:customers,id',
            'place_id' => 'required|exists:places,id',
            'tableplan_id' => 'required|exists:tableplans,id',
            'area_id' => 'required|exists:areas,id',
            'table_ids' => 'required|array',
            'seats' => 'required|integer',
            'reservation_time' => 'required|date_format:Y-m-d H:i:s',
            'status' => 'required',
            'is_take_away' => 'required|boolean',
            'source' => 'required|in:online,internal'
        ]);

        $order = Order::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $order->update([
            'customer_id' => $request->customer_id,
            'place_id' => $request->place_id,
            'tableplan_id' => $request->tableplan_id,
            'area_id' => $request->area_id,
            'table_ids' => $request->table_ids,
            'seats' => $request->seats,
            'reservation_time' => $request->reservation_time,
            'comment' => $request->comment ?? '',
            'status' => $request->status,
            'is_take_away' => $request->is_take_away,
            'source' => $request->source,
            'marks' => $request->marks ?? ''
        ]);

        Log::add($request,'change-order','Changed order #'.$order->id);

        if($res){
            $order = Order::find($id);
            return response()->json($order);
        }else{
            return response()->json(['message' => 'Order not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $order = Order::find($id);

        if(!Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($order);
    }

    public function getAllByParams(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'reservation_from' => 'required|date_format:Y-m-d H:i:s',
            'reservation_to' => 'required|date_format:Y-m-d H:i:s',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $orders = Order::where('place_id',$request->place_id)
            ->where('area_id',$request->area_id)
            ->whereBetween('reservation_time', [$request->reservation_from, $request->reservation_to])
            ->get();

        return response()->json($orders);
    }

    public function getAllByCustomer(Request $request)
    {
        if(!Auth::user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $orders = Order::where('customer_id',Auth::user()->id)
            ->get();

        return response()->json($orders);
    }

    public function delete($id, Request $request)
    {
        $order = Order::find($id);

        if(!Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'delete-order','Deleted order #'.$order->id);

        $order->delete();

        return response()->json(['message' => 'Order is deleted']);
    }

    public function setStatus($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'status' => 'required',
        ]);

        $order = Order::find($id);

        if(!Auth::user()->places->contains($order->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $order->update([
            'status' => $request->status,
        ]);

        Log::add($request,'change-order-status','Changed order #'.$order->id.' status '.$request->status);

        return response()->json(['message' => 'Order status changed']);
    }
}
