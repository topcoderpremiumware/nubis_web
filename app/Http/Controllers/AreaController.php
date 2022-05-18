<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AreaController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $area = Area::create([
            'name' => $request->name,
            'place_id' => $request->place_id
        ]);

        Log::add($request,'create-area','Created area');

        return response()->json($area);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
        ]);

        $area = Area::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($area->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $area->update([
            'name' => $request->name,
            'place_id' => $request->place_id,
        ]);

        Log::add($request,'change-area','Changed area');

        if($res){
            $area = Area::find($id);
            return response()->json($area);
        }else{
            return response()->json(['message' => 'Area not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $area = Area::find($id);

        if(!Auth::user()->places->contains($area->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($area);
    }

    public function getAllByPlace($place_id, Request $request)
    {
        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $areas = Area::where('place_id',$place_id)->get();

        return response()->json($areas);
    }
}
