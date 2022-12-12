<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Log;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        if(!Auth::user()->orders || !Auth::user()->orders->contains($request->order_id)){
            return response()->json([
                'message' => 'It\'s not your order'
            ], 400);
        }

        $feedback = Feedback::where('order_id',$request->order_id)->first();
        if($feedback){
            return response()->json([
                'message' => 'Feedback has already been created'
            ], 400);
        }

        $request->validate([
//            'customer_id' => 'required|exists:customers,id',
//            'place_id' => 'required|exists:places,id',
            'order_id' => 'required|exists:orders,id',
            'comment' => 'required',
            'status' => 'required',
            'food_mark' => 'required|numeric',
            'service_mark' => 'required|numeric',
            'ambiance_mark' => 'required|numeric',
            'experience_mark' => 'required|numeric',
            'price_mark' => 'required|numeric',
            'is_recommend' => 'required|boolean'
        ]);

        $order = Order::find($request->order_id);

        $marks = [$request->food_mark,$request->service_mark,$request->ambiance_mark,$request->experience_mark,$request->price_mark];
        $feedback = Feedback::create([
            'customer_id' => $order->customer_id,
            'place_id' => $order->place_id,
            'order_id' => $request->order_id,
            'comment' => $request->comment,
            'status' => $request->status,
            'food_mark' => $request->food_mark,
            'service_mark' => $request->service_mark,
            'ambiance_mark' => $request->ambiance_mark,
            'experience_mark' => $request->experience_mark,
            'price_mark' => $request->price_mark,
            'average_mark' => round(array_sum($marks) / count($marks),2),
            'is_recommend' => $request->is_recommend,
        ]);

        //Log::add($request,'create-feedback','Created feedback #'.$feedback->id);

        return response()->json($feedback);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'place_id' => 'required|exists:places,id',
            'order_id' => 'required|exists:orders,id',
            'comment' => 'required',
            'status' => 'required',
            'food_mark' => 'required|numeric',
            'service_mark' => 'required|numeric',
            'ambiance_mark' => 'required|numeric',
            'experience_mark' => 'required|numeric',
            'price_mark' => 'required|numeric',
            'average_mark' => 'required|numeric',
            'is_recommend' => 'required|boolean'
        ]);

        $feedback = Feedback::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($feedback->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }
        $marks = [$request->food_mark,$request->service_mark,$request->ambiance_mark,$request->experience_mark,$request->price_mark];
        $res = $feedback->update([
            'customer_id' => $request->customer_id,
            'place_id' => $request->place_id,
            'order_id' => $request->order_id,
            'comment' => $request->comment,
            'status' => $request->status,
            'food_mark' => $request->food_mark,
            'service_mark' => $request->service_mark,
            'ambiance_mark' => $request->ambiance_mark,
            'experience_mark' => $request->experience_mark,
            'price_mark' => $request->price_mark,
            'average_mark' => round(array_sum($marks) / count($marks),2),
            'is_recommend' => $request->is_recommend,
        ]);

        Log::add($request,'change-feedback','Changed feedback #'.$feedback->id);

        if($res){
            $feedback = Feedback::find($id);
            return response()->json($feedback);
        }else{
            return response()->json(['message' => 'Feedback not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $feedback = Feedback::find($id);

        if(!Auth::user()->places->contains($feedback->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($feedback);
    }

    public function getAllByPlace(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $feedbacks = Feedback::where('place_id',$request->place_id)
            ->get();

        return response()->json($feedbacks);
    }

    public function getAllPublic(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

//        if(!Auth::user()->places->contains($request->place_id)){
//            return response()->json([
//                'message' => 'It\'s not your place'
//            ], 400);
//        }

        $feedbacks = Feedback::where('place_id',$request->place_id)
            ->where('status','public')
            ->get();

        return response()->json($feedbacks);
    }
}
