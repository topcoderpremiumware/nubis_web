<?php

namespace App\Http\Controllers;

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

        return response()->json($place);
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
