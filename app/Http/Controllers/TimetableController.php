<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Timetable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TimetableController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'tableplan_id' => 'exists:tableplan,id',
            'area_id' => 'required|exists:area,id',
            'start_date' => 'date_format:Y-m-d',
            'end_date' => 'date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'length' => 'required|integer',
            'max' => 'required|integer',
            'min' => 'required|integer',
            'week_days' => 'array',
            'status' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $timetable = Timetable::create([
            'place_id' => $request->place_id,
            'tableplan_id' => $request->has('tableplan_id') ? $request->tableplan_id : null,
            'area_id' => $request->area_id,
            'start_date' => $request->has('start_date') ? $request->start_date : null,
            'end_date' => $request->has('end_date') ? $request->start_date : null,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'length' => $request->length,
            'max' => $request->max,
            'min' => $request->min,
            'week_days' => $request->has('week_days') ? $request->week_days : [],
            'status' => $request->status
        ]);

        Log::add($request,'create-timetable','Created timetable');

        return response()->json($timetable);
    }

    public function save($id, Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'tableplan_id' => 'exists:tableplan,id',
            'area_id' => 'required|exists:area,id',
            'start_date' => 'date_format:Y-m-d',
            'end_date' => 'date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'length' => 'required|integer',
            'max' => 'required|integer',
            'min' => 'required|integer',
            'week_days' => 'array',
            'status' => 'required'
        ]);

        $timetable = Timetable::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($timetable->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = $timetable->update([
            'place_id' => $request->place_id,
            'tableplan_id' => $request->has('tableplan_id') ? $request->tableplan_id : null,
            'area_id' => $request->area_id,
            'start_date' => $request->has('start_date') ? $request->start_date : null,
            'end_date' => $request->has('end_date') ? $request->start_date : null,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'length' => $request->length,
            'max' => $request->max,
            'min' => $request->min,
            'week_days' => $request->has('week_days') ? $request->week_days : [],
            'status' => $request->status
        ]);

        Log::add($request,'change-timetable','Changed timetable');

        if($res){
            $timetable = Timetable::find($id);
            return response()->json($timetable);
        }else{
            return response()->json(['message' => 'Timetable not updated'],400);
        }
    }

    public function getId($id, Request $request)
    {
        $timetable = Timetable::find($id);

        if(!Auth::user()->places->contains($timetable->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($timetable);
    }
}
