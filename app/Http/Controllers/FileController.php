<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function set($purpose, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'file' => 'required|file|max:1024'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $file = File::where('place_id',$request->place_id)
            ->where('purpose',$purpose)
            ->first();

        if($file){
            Storage::disk('public')->delete($file->filename);
        }

        $file_upload = $request->file('file');
        $filename = $request->place_id.'/'.$file_upload->getClientOriginalName();
        $content = $file_upload->getContent();
        Storage::disk('public')->put($filename,$content);

        if($file){
            $res = $file->update([
                'place_id' => $request->place_id,
                'purpose' => $request->purpose,
                'filename' => $filename
            ]);
            $file->refresh();
        }else{
            $file = File::create([
                'place_id' => $request->place_id,
                'purpose' => $request->purpose,
                'filename' => $filename
            ]);
        }

        Log::add($request,'change-file','Changed file #'.$file->id);

        return response()->json($file);
    }

    public function setMany($purpose, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'files.*' => 'required|mimes:jpg,png|max:1024'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        if(!$request->files->get('files')){
            abort(400, 'Files field is empty');
        }

        /** @var UploadedFile $file */
        foreach($request->files->get('files') as $index => $file) {
            $filename = $request->place_id.'/'.Carbon::now()->timestamp.'_'.$index.'.'.$file->getClientOriginalExtension();
            Storage::disk('public')->put($filename, $file->getContent());

            $file = File::create([
                'place_id' => $request->place_id,
                'purpose' => $request->purpose,
                'filename' => $filename
            ]);
        }

        Log::add($request,'change-file','Changed file #'.$file->id);

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

        if($files->count() == 0){
            return response()->json(['message' => 'Files not found'], 400);
        }

        return response()->json($files);
    }

    public function getByPurpose(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'purpose' => 'required'
        ]);

        $file = File::where('place_id',$request->place_id)
            ->where('purpose',$request->purpose)
            ->first();

        if($file === null){
            return response()->json(['message' => 'File not exist'], 400);
        }

        return response()->json($file);
    }

    public function findByPurpose(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'purpose' => 'required'
        ]);

        $files = File::where('place_id',$request->place_id)
            ->where('purpose','like','%'.$request->purpose.'%')
            ->get();

        if($files->count() == 0){
            return response()->json(['message' => 'Files not found'], 400);
        }

        return response()->json($files);
    }

    public function delete($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $file = File::findOrFail($id);

        if(!Auth::user()->places->contains($file->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Storage::disk('public')->delete($file->filename);
        $file->delete();

        return response()->json(['message' => 'File removed successfully']);
    }

    public function getManyByPurpose(Request $request)
    {
        $request->validate([
            'place_id' => 'required|integer|exists:places,id',
            'purposes' => 'required|array'
        ]);

        $files = File::where('place_id',$request->place_id)
            ->where(function($q) use ($request) {
                foreach ($request->purposes as $purpose){
                    $q->orWhere('purpose','like',$purpose.'%');
                }
            })
            ->get();

        return response()->json($files);
    }
}
