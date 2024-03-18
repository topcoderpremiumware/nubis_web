<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    public function save(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|integer|exists:places,id',
            'name' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $settings = Setting::updateOrCreate([
            'place_id' => $request->place_id,
            'name' => $request->name
        ],[
            'value' => $request->value ?? ''
        ]);

        Log::add($request,'change-settings','Changed place settings');

        return response()->json($settings);
    }

    public function get(Request $request)
    {
        $request->validate([
            'place_id' => 'required|integer|exists:places,id',
            'name' => 'required'
        ]);

        $setting = Setting::where('place_id',$request->place_id)
            ->where('name',$request->name)
            ->first();

        if(!$setting){
            return response()->json([
                'message' => 'Settings do not exist.'
            ], 400);
        }

        return response()->json($setting);
    }

    public function saveMany(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|integer|exists:places,id',
            'data' => 'required|array',
            'data.*.name' => 'required',
            'data.*.value' => 'nullable'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $settings = [];
        foreach ($request->data as $datum) {
            $settings[] = Setting::updateOrCreate([
                'place_id' => $request->place_id,
                'name' => $datum['name']
            ],[
                'value' => $datum['value'] ?? ''
            ]);
        }

        Log::add($request,'change-settings','Changed place settings');

        return response()->json($settings);
    }

    public function getMany(Request $request)
    {
        $request->validate([
            'place_id' => 'required|integer|exists:places,id',
            'names' => 'required|array'
        ]);

        $settings = Setting::where('place_id',$request->place_id)
            ->whereIn('name',$request->names)
            ->get();

        return response()->json($settings);
    }
}
