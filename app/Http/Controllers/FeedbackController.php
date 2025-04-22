<?php

namespace App\Http\Controllers;

use App\Helpers\TemplateHelper;
use App\Models\Feedback;
use App\Models\Place;
use App\Models\Log;
use App\Models\Order;
use App\SMS\SMS;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    public function create(Request $request)
    {
//        if(!Auth::user()->tokenCan('customer')) return response()->json([
//            'message' => 'Unauthorized.'
//        ], 401);

//        if(!Auth::user()->is_superadmin && (!Auth::user()->orders || !Auth::user()->orders->contains($request->order_id))){
//            return response()->json([
//                'message' => 'It\'s not your order'
//            ], 400);
//        }

        $feedback = Feedback::where('order_id',$request->order_id)->first();
        if($feedback){
            return response()->json([
                'message' => 'Feedback has already been created'
            ], 400);
        }

        $request->validate([
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

        if(!Auth::user()->is_superadmin && (!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($feedback->place_id))){
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

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($feedback->place_id)){
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

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $feedbacks = Feedback::where('place_id',$request->place_id)
            ->with(['customer','place','order.area'])
            ->get();

        return response()->json($feedbacks);
    }

    public function getAllPublic(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

//        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
//            return response()->json([
//                'message' => 'It\'s not your place'
//            ], 400);
//        }

        $feedbacks = Feedback::where('place_id',$request->place_id)
            ->with(['customer','order'])
            ->where('status','public')
            ->get();

        return response()->json($feedbacks);
    }

    public function makeReply($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'reply' => 'required',
        ]);

        $feedback = Feedback::find($id);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($feedback->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }
        $data = ['reply' => $request->reply];
        if($request->has('status')){
            $data['status'] = $request->status;
        }
        $res = $feedback->update($data);

        if($feedback->reply !== $request->reply) {
            if($feedback->customer_id){
                $phone = $feedback->customer->phone;
                $email = $feedback->customer->email;
            }else{
                $phone = $feedback->order->phone;
                $email = $feedback->order->email;
            }
            if($feedback->place->allow_send_sms()){
                $feedback->place->decrease_sms_limit();
                $result = SMS::send([$phone], $request->reply, env('APP_SHORT_NAME'));
            }

            $place = Place::find($feedback->place_id);
            try{
                \Illuminate\Support\Facades\Mail::html($request->reply, function ($msg) use ($place, $email) {
                    $msg->to($email)->subject('Reply to feedback');
                    $msg->from(env('MAIL_FROM_ADDRESS'), $place->name);
                });
            }catch (\Exception $e){}
        }

        Log::add($request,'change-feedback-reply','Changed feedback #'.$feedback->id);

        return response()->json(['message' => 'Feedback reply is made']);
    }

    public function isFeedbackExist(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id'
        ]);

        $feedback = Feedback::where('order_id',$request->order_id)->first();
        if($feedback){
            return response()->json(['message' => 'Feedback has already been created']);
        }else{
            return response()->json(['message' => 'Feedback hasn\'t been created yet']);
        }
    }
}
