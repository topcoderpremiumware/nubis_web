<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Log;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MenuController extends Controller
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

        $menu = Menu::create([
            'name' => $request->name,
            'place_id' => $request->place_id
        ]);

        Log::add($request,'create-menu','Created menu');

        return response()->json($menu);
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

        $menu = Menu::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($menu->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $menu->update([
            'name' => $request->name,
            'place_id' => $request->place_id,
        ]);

        Log::add($request,'change-menu','Changed menu');

        if($res){
            $menu = Menu::find($id);
            return response()->json($menu);
        }else{
            return response()->json(['message' => 'Menu not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $menu = Menu::with('dishes')->find($id);

        if(!Auth::user()->places->contains($menu->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($menu);
    }

    public function getAllByPlace($place_id, Request $request)
    {
        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $menus = Menu::where('place_id',$place_id)->get();

        return response()->json($menus);
    }

    public function setDishes($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $menu = Menu::findOrFail($id);

        if(!Auth::user()->places->contains($menu->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $request->validate([
            'dishes' => 'required|array'
        ]);

        Log::add($request,'dishes-menu','Changed menu dishes');

        $menu->dishes()->sync($request->dishes);
        return response()->json(['message' => 'Dishes are set']);
    }
}
