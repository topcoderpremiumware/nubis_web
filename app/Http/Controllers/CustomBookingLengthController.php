<?php

namespace App\Http\Controllers;

use App\Models\CustomBookingLength;
use App\Models\Log;
use App\Models\Timetable;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CustomBookingLengthController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'length' => 'required|integer',
            'active' => 'required',
            'start_date' => 'date_format:Y-m-d',
            'end_date' => 'date_format:Y-m-d',
            'max' => 'required|integer',
            'min' => 'required|integer',
            'area_ids' => 'required|array',
            'priority' => 'required|integer',
            'labels' => 'required',
//            'month_days' => 'array',
//            'week_days' => 'array',
//            'spec_dates' => 'array',
            'time_intervals' => 'required|array',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $filename = null;

        if($request->file('image')){
            $file_upload = $request->file('image');
            $filename = $request->place_id.'/'.$file_upload->getClientOriginalName();
            $content = $file_upload->getContent();
            Storage::disk('public')->put($filename,$content);
        }

        $custom_booking_length = CustomBookingLength::create([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'length' => $request->length,
            'preparation_length' => $request->preparation_length,
            'active' => $request->active,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'max' => $request->max,
            'min' => $request->min,
            'priority' => $request->priority,
            'labels' => $request->labels,
            'month_days' => $request->has('month_days') && $request->month_days != 'null' ? $request->month_days : [],
            'week_days' => $request->has('week_days') && $request->week_days != 'null' ? $request->week_days : [],
            'spec_dates' => $request->has('spec_dates') && $request->spec_dates != 'null' ? $request->spec_dates : [],
            'time_intervals' => $request->has('time_intervals') && $request->time_intervals != 'null' ? $request->time_intervals : [],
            'image' => $filename,
        ]);

        Log::add($request,'create-custom_booking_length','Created custom booking length #'.$custom_booking_length->id);

        $custom_booking_length->areas()->sync($request->area_ids);

        return response()->json($custom_booking_length);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'length' => 'required|integer',
            'active' => 'required',
            'start_date' => 'date_format:Y-m-d',
            'end_date' => 'date_format:Y-m-d',
            'max' => 'required|integer',
            'min' => 'required|integer',
            'area_ids' => 'required|array',
            'priority' => 'required|integer',
            'labels' => 'required',
//            'month_days' => 'array',
//            'week_days' => 'array',
//            'spec_dates' => 'array',
            'time_intervals' => 'required|array',
        ]);

        $custom_booking_length = CustomBookingLength::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($custom_booking_length->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $filename = null;

        if($request->file('image')){
            $file_upload = $request->file('image');
            $filename = $request->place_id.'/'.$file_upload->getClientOriginalName();
            $content = $file_upload->getContent();
            Storage::disk('public')->put($filename,$content);
        }

        if($custom_booking_length->image && $filename && $custom_booking_length->image != $filename){
            Storage::disk('public')->delete($custom_booking_length->image);
        }

        $res = $custom_booking_length->update([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'length' => $request->length,
            'preparation_length' => $request->preparation_length,
            'active' => $request->active,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'max' => $request->max,
            'min' => $request->min,
            'priority' => $request->priority,
            'labels' => $request->labels,
            'month_days' => $request->has('month_days') && $request->month_days != 'null' ? $request->month_days : [],
            'week_days' => $request->has('week_days') && $request->week_days != 'null' ? $request->week_days : [],
            'spec_dates' => $request->has('spec_dates') && $request->spec_dates != 'null' ? $request->spec_dates : [],
            'time_intervals' => $request->has('time_intervals') && $request->time_intervals != 'null' ? $request->time_intervals : [],
            'image' => $filename ? $filename : $custom_booking_length->image,
        ]);

        Log::add($request,'change-custom_booking_length','Changed custom booking length #'.$id);

        if($res){
            $custom_booking_length = CustomBookingLength::find($id);
            $custom_booking_length->areas()->sync($request->area_ids);
            return response()->json($custom_booking_length);
        }else{
            return response()->json(['message' => 'Custom booking length not updated'],400);
        }
    }

    public function delete($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $custom_booking_length = CustomBookingLength::find($id);

        if(!Auth::user()->places->contains($custom_booking_length->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        if($custom_booking_length->image){
            Storage::disk('public')->delete($custom_booking_length->image);
        }

        Log::add($request,'delete-custom_booking_length','Deleted custom booking length #'.$custom_booking_length->id);

        $custom_booking_length->delete();

        return response()->json(['message' => 'Custom booking length is deleted']);
    }

    public function getId($id, Request $request)
    {
        $custom_booking_length = CustomBookingLength::find($id);

        if(!Auth::user()->places->contains($custom_booking_length->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($custom_booking_length);
    }

    public function getAllByPlace($place_id, Request $request)
    {
        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $custom_lengths = CustomBookingLength::where('place_id',$place_id)->get();

        return response()->json($custom_lengths);
    }

    public function getAllByParams(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'reservation_date' => 'required|date_format:Y-m-d',
            'language' => 'required',
            'seats' => 'required|integer'
        ]);

        $custom_lengths = CustomBookingLength::where('place_id',$request->place_id)
            ->whereHas('areas', function ($q) use ($request){
                $q->where('areas.id', $request->area_id);
            })
            ->where('active', 1)
            ->where('start_date', '<=', $request->reservation_date)
            ->where('end_date', '>=', $request->reservation_date)
            ->where('max', '>=', $request->seats)
            ->where('min', '<=', $request->seats)
            ->orderBy('priority', 'desc')
            ->get();

        $lengths_data = [];
        foreach ($custom_lengths as $custom_length){
            if(!array_key_exists($request->language,$custom_length->labels)) continue;
            $condition = 'verify';
            foreach ($custom_length->spec_dates as $spec_date){
                if($request->reservation_date == $spec_date['date']){
                    if($spec_date['active']){
                        $condition = 'yes';
                    }else{
                        continue 2;
                    }
                }
            }
            if($condition == 'verify'){
                $date = Carbon::parse($request->reservation_date);
                if(!in_array($date->format('j'),$custom_length->month_days)) continue;
                if(!in_array($date->format('w'),$custom_length->week_days)) continue;
            }

            $times = [];
            foreach ($custom_length->time_intervals as $time_interval) {
                $time = Carbon::parse($request->reservation_date . ' ' . $time_interval['from']);
                $end = Carbon::parse($request->reservation_date . ' ' . $time_interval['to']);
                for ($time; $time->lt($end); $time->addMinutes(15)) {
                    array_push($times,$time->copy());
                }
            }
            $times = array_values(array_unique($times));

            if(count($times) > 0){
                array_push($lengths_data,[
                    'id' => $custom_length->id,
                    'name' => $custom_length->labels[$request->language]['name'],
                    'description' => $custom_length->labels[$request->language]['description'],
                    'image' => Storage::disk('public')->url($custom_length->image),
                    'length' => intval($custom_length->length)+intval($custom_length->preparation_length),
                    'time' => $times
                ]);
            }
        }

        return response()->json($lengths_data);
    }
}
