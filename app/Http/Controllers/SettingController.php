<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

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
            ->whereNotIn('name',['p12_key_file','p12_password'])
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
            ->whereNotIn('name',['p12_key_file','p12_password'])
            ->whereIn('name',$request->names)
            ->get();

        return response()->json($settings);
    }

    public function hasKey(Request $request)
    {
        $request->validate([
            'place_id' => 'required|integer|exists:places,id'
        ]);

        $settings = Setting::where('place_id',$request->place_id)
            ->whereIn('name',['p12_key_file','p12_password'])
            ->get();

        $data = ['pass' => false, 'file' => false];
        foreach ($settings as $setting) {
            if($setting->name === 'p12_key_file') $data['file'] = true;
            if($setting->name === 'p12_password') $data['pass'] = true;
        }

        return response()->json($data);
    }

    public function saveKey(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|integer|exists:places,id',
            'file' => 'required|file|max:1024',
            'pass' => 'required|min:5',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $old_setting = Setting::where('place_id',$request->place_id)
            ->where('name','p12_key_file')
            ->first();

        if($old_setting){
            Storage::disk('private')->delete($old_setting->value);
        }

        $file_upload = $request->file('file');
        $filename = 'sign_keys/'.$request->place_id.'/'.Carbon::now()->timestamp.'.'.$file_upload->getClientOriginalExtension();
        $content = $file_upload->getContent();
        Storage::disk('private')->put($filename,$content);

        Setting::updateOrCreate([
            'place_id' => $request->place_id,
            'name' => 'p12_key_file'
        ],[
            'value' => $filename
        ]);

        Setting::updateOrCreate([
            'place_id' => $request->place_id,
            'name' => 'p12_password'
        ],[
            'value' => Crypt::encryptString($request->pass)
        ]);

        Log::add($request,'change-settings','Changed place sign key');

        return response()->json([]);
    }
}
