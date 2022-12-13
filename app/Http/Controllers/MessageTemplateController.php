<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\MessageTemplate;
use App\SMS\SMS;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageTemplateController extends Controller
{
    public function save($purpose, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'text' => 'required',
            'active' => 'required',
            'language' => 'required',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $template = MessageTemplate::updateOrCreate([
            'place_id' => $request->place_id,
            'purpose' => $request->purpose,
            'language' => $request->language],
            ['subject' => $request->subject ?? env('APP_NAME'),
            'text' => $request->text,
            'active' => $request->active
        ]);

        Log::add($request,'change-message_template','Changed message template #'.$template->id);

        return response()->json($template);
    }

    public function getId($purpose, Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'language' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $template = MessageTemplate::where('place_id',$request->place_id)
            ->where('purpose',$purpose)
            ->where('language',$request->language)
            ->firstOrFail();

        return response()->json($template);
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

        $template = MessageTemplate::where('place_id',$request->place_id)
            ->get();

        return response()->json($template);
    }

    public function sendTestSms(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'text' => 'required',
            'phone' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        // TODO: get SMS API token of current place and set in to send function as 4th param

        $result = SMS::send([$request->phone], $request->text, env('APP_NAME'));

        return response()->json(['message' => 'The message has been sent', 'result' => $result]);
    }

    public function sendTestEmail(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'text' => 'required',
            'subject' => 'required',
            'mail' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        \Illuminate\Support\Facades\Mail::html($request->text, function($msg) use ($request) {$msg->to($request->mail)->subject($request->subject); });

        return response()->json(['message' => 'The message has been sent']);
    }
}
