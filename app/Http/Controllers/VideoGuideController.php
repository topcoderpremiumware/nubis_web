<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Setting;
use App\Models\User;
use App\Models\VideoGuide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VideoGuideController extends Controller
{
    public function save(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'language' => 'required'
        ]);

        if($request->has('id')){
            $video_guide = VideoGuide::find($request->id);
            $video_guide->update([
                'title' => $request->title,
                'description' => $request->description,
                'youtube_id' => $request->youtube_id,
                'page_url' => $request->page_url,
                'language' => $request->language
            ]);
        }else{
            $video_guide = VideoGuide::create([
                'title' => $request->title,
                'description' => $request->description,
                'youtube_id' => $request->youtube_id,
                'page_url' => $request->page_url,
                'language' => $request->language
            ]);
        }

        Log::add($request,'change-video_guide','Changed video guide #'.$video_guide->id);

        return response()->json($video_guide);
    }

    public function getByLanguage(Request $request)
    {
        $request->validate([
            'language' => 'required'
        ]);

        $video_guides = VideoGuide::where('language',$request->language)
            ->get();

        return response()->json($video_guides);
    }

    public function delete($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $video_guide = VideoGuide::find($id);

        $video_guide->delete();

        return response()->json(['message' => 'Video guide is deleted']);
    }
}
