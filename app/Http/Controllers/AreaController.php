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
            'priority' => 'required|integer',
            'labels' => 'required',
            'online_available' => 'required|integer',

        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $area = Area::create([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'priority' => $request->priority,
            'labels' => $request->labels,
            'online_available' => $request->online_available,
        ]);

        Log::add($request,'create-area','Created area #'.$area->id);

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
            'priority' => 'required|integer',
            'labels' => 'required',
            'online_available' => 'required|integer',
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
            'priority' => $request->priority,
            'labels' => $request->labels,
            'online_available' => $request->online_available,
        ]);

        Log::add($request,'change-area','Changed area #'.$id);

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
        $query = Area::where('place_id',$place_id);
        if(!$request->has('all'))
            $query->where('online_available',1);
        $areas = $query->orderBy('priority', 'desc')
            ->get();

        return response()->json($areas);
    }

    public function delete($id, Request $request)
    {
        $area = Area::find($id);

        if(!Auth::user()->places->contains($area->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'delete-area','Deleted area #'.$area->id);

        $area->delete();

        return response()->json(['message' => 'Area is deleted']);
    }
}
