<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Place;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlaceController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
            'country_id' => 'required|exists:countries,id'
        ]);

        $place = Place::create([
            'name' => $request->name,
            'address' => $request->address ?? '',
            'city' => $request->city ?? '',
            'zip_code' => $request->zip_code ?? '',
            'phone' => $request->phone ?? '',
            'email' => $request->email ?? '',
            'home_page' => $request->home_page ?? '',
            'country_id' => $request->country_id
        ]);

        Auth::user()->places()->attach($place->id);
        $role = Role::firstOrCreate([
            'title' => 'admin'
        ]);
        Auth::user()->roles()
        ->wherePivot('place_id',$place->id)
        ->syncWithPivotValues([$role->id], ['place_id' => $place->id]);

        Log::add($request,'create-place','Created place #'.$place->id);

        return response()->json($place);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
            'country_id' => 'required|exists:countries,id'
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
            'country_id' => $request->country_id
        ]);

        Log::add($request,'change-place','Changed place #'.$id);

        if($res){
            $place = Place::find($id);
            return response()->json($place);
        }else{
            return response()->json(['message' => 'Place not updated'],400);
        }
    }

    public function getAll(Request $request)
    {
        $places = Place::all();

        return response()->json($places);
    }

    public function getAllMine(Request $request)
    {
        $places = Auth::user()->places;

        return response()->json($places);
    }

    public function getId($id, Request $request)
    {
//        if(!Auth::user()->places->contains($id)){
//            return response()->json([
//                'message' => 'It\'s not your place'
//            ], 400);
//        }

        $place = Place::find($request->id);

        return response()->json($place);
    }
}
