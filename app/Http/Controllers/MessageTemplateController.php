<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\MessageTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageTemplateController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'purpose' => 'required',
            'subject' => 'required',
            'text' => 'required',
            'language' => 'required',
        ]);

        $template = MessageTemplate::create([
            'place_id' => $request->place_id,
            'purpose' => $request->purpose,
            'subject' => $request->subject,
            'text' => $request->text,
            'language' => $request->language
        ]);

        Log::add($request,'create-message_template','Created message template');

        return response()->json($template);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'purpose' => 'required',
            'subject' => 'required',
            'text' => 'required',
            'language' => 'required',
        ]);

        $template = MessageTemplate::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($template->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $template->update([
            'place_id' => $request->place_id,
            'purpose' => $request->purpose,
            'subject' => $request->subject,
            'text' => $request->text,
            'language' => $request->language
        ]);

        Log::add($request,'change-message_template','Changed message template');

        if($res){
            $template = MessageTemplate::find($id);
            return response()->json($template);
        }else{
            return response()->json(['message' => 'Template not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $template = MessageTemplate::find($id);

        if(!Auth::user()->places->contains($template->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

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
