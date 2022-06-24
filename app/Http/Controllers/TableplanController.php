<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Place;
use App\Models\Tableplan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\Console\Helper\Table;

class TableplanController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
            'data' => 'array'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $tableplan = Tableplan::create([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'data' => $request->data
        ]);

        Log::add($request,'create-tableplan','Created tableplan #'.$tableplan->id);

        return response()->json($tableplan);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
            'data' => 'array'
        ]);

        $tableplan = Tableplan::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($tableplan->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $tableplan->update([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'data' => $request->data
        ]);

        Log::add($request,'change-tableplan','Changed tableplan #'.$id);

        if($res){
            $tableplan = Tableplan::find($id);
            return response()->json($tableplan);
        }else{
            return response()->json(['message' => 'Tableplan not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $tableplan = Tableplan::find($id);

        if(!Auth::user()->places->contains($tableplan->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($tableplan);
    }

    public function getAllByPlace($place_id, Request $request)
    {
        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $tableplans = Tableplan::where('place_id',$place_id)->get();

        return response()->json($tableplans);
    }

    public function delete($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $tableplan = Tableplan::find($id);

        if(!Auth::user()->places->contains($tableplan->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'delete-tableplan','Deleted tableplan #'.$tableplan->id);

        $tableplan->delete();

        return response()->json(['message' => 'Tableplan is deleted']);
    }
}
