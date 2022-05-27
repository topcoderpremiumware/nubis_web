<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'perpose' => 'required',
            'file' => 'required'
        ]);

        $file_upload = $request->file('file');
        $filename = $request->place_id.'/'.$file_upload->getClientOriginalName();
        $content = $file_upload->getContent();
        Storage::disk('public')->put($filename,$content);

        $file = File::create([
            'place_id' => $request->place_id,
            'perpose' => $request->perpose,
            'filename' => $filename
        ]);

        Log::add($request,'create-file','Created file #'.$file->id);

        return response()->json($file);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'perpose' => 'required',
            'file' => 'required'
        ]);

        $file = File::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($file->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }
        Storage::disk('public')->delete($file->filename);
        $file_upload = $request->file('file');
        $filename = $request->place_id.'/'.$file_upload->getClientOriginalName();
        $content = $file_upload->getContent();
        Storage::disk('public')->put($filename,$content);

        $res = $file->update([
            'place_id' => $request->place_id,
            'perpose' => $request->perpose,
            'filename' => $filename
        ]);

        Log::add($request,'change-file','Changed file #'.$file->id);

        if($res){
            $file = File::find($id);
            return response()->json($file);
        }else{
            return response()->json(['message' => 'File not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $file = File::find($id);

        if(!Auth::user()->places->contains($file->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($file);
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

        $files = File::where('place_id',$request->place_id)
            ->get();

        return response()->json($files);
    }

    public function getByPerpose(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'perpose' => 'required'
        ]);

        $file = File::where('place_id',$request->place_id)
            ->where('perpose',$request->perpose)
            ->first();

        if($file === null){
            return response()->json(['message' => 'File not exist'], 400);
        }

        return response()->json($file);
    }
}
