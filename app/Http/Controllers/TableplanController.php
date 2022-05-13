<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Tableplan;
use Illuminate\Http\Request;

class TableplanController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
            'data' => 'required|array'
        ]);

        $tableplan = Tableplan::create([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'data' => $request->data
        ]);

        $tableplan->place()->attach($request->place_id);

        Log::add($request,'create-tableplan','Created tableplan');

        return response()->json($tableplan);
    }
}
