<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlaceController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required',
        ]);

        $place = Place::create([
            'name' => $request->name,
            'address' => $request->address ?? '',
            'city' => $request->city ?? '',
            'zip_code' => $request->zip_code ?? '',
            'phone' => $request->phone ?? '',
            'email' => $request->email ?? '',
            'home_page' => $request->home_page ?? '',
        ]);

        Auth::user()->places()->attach($place->id);

        Log::add($request,'create-place','Created place');

        return response()->json($place);
    }

    public function save($id, Request $request)
    {
        $request->validate([
            'name' => 'required',
        ]);

        if(!Auth::user()->places->contains($id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = Place::find($id)->update([
            'name' => $request->name,
            'address' => $request->address ?? '',
            'city' => $request->city ?? '',
            'zip_code' => $request->zip_code ?? '',
            'phone' => $request->phone ?? '',
            'email' => $request->email ?? '',
            'home_page' => $request->home_page ?? '',
        ]);

        Log::add($request,'change-place','Changed place');

        if($res){
            $place = Place::find($id);
            return response()->json($place);
        }else{
            return response()->json(['message' => 'Place not updated'],400);
        }
    }

    public function getAll(Request $request)
    {
        $places = Auth::user()->places;

        return response()->json($places);
    }

    public function getId($id, Request $request)
    {
        if(!Auth::user()->places->contains($id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $place = Place::find($request->id);

        return response()->json($place);
    }
}
