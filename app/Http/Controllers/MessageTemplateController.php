<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\MessageTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageTemplateController extends Controller
{
//    public function create(Request $request)
//    {
//        if(!Auth::user()->tokenCan('admin')) return response()->json([
//            'message' => 'Unauthorized.'
//        ], 401);
//
//        $request->validate([
//            'place_id' => 'required|exists:places,id',
//            'purpose' => 'required',
//            'subject' => 'required',
//            'text' => 'required',
//            'language' => 'required',
//        ]);
//
//        $template = MessageTemplate::create([
//            'place_id' => $request->place_id,
//            'purpose' => $request->purpose,
//            'subject' => $request->subject,
//            'text' => $request->text,
//            'language' => $request->language
//        ]);
//
//        Log::add($request,'create-message_template','Created message template');
//
//        return response()->json($template);
//    }

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
}
