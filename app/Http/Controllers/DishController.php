<?php

namespace App\Http\Controllers;

use App\Models\Dish;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DishController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
        ]);

        $dish = Dish::create([
            'name' => $request->name,
        ]);

        Log::add($request,'create-dish','Created dish');

        return response()->json($dish);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
        ]);

        $dish = Dish::find($id);

        $res = $dish->update([
            'name' => $request->name,
        ]);

        Log::add($request,'change-dish','Changed dish');

        if($res){
            $dish = Dish::find($id);
            return response()->json($dish);
        }else{
            return response()->json(['message' => 'Dish not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $dish = Dish::find($id);

        return response()->json($dish);
    }

    public function getAll(Request $request)
    {
        $dishes = Dish::all();

        return response()->json($dishes);
    }
}
