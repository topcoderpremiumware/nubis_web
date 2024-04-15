<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Log;
use App\Models\Tableplan;
use App\Models\Timetable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TimetableController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
//            'tableplan_id' => 'exists:tableplans,id',
            'area_id' => 'required|exists:areas,id',
            'start_date' => 'date_format:Y-m-d',
            'end_date' => 'date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'length' => 'required|integer',
            'max' => 'required|integer',
            'min' => 'required|integer',
            'week_days' => 'array',
            'status' => 'required',
            'min_time_before' => 'required|integer'
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
            'end_date' => $request->has('end_date') ? $request->end_date : null,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'length' => $request->length,
            'max' => $request->max,
            'min' => $request->min,
            'week_days' => $request->has('week_days') ? $request->week_days : [],
            'status' => $request->status,
            'booking_limits' => $request->booking_limits,
            'min_time_before' => $request->min_time_before,
            'future_booking_limit' => $request->future_booking_limit,
        ]);

        Log::add($request,'create-timetable','Created timetable #'.$timetable->id);

        return response()->json($timetable);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
//            'tableplan_id' => 'exists:tableplans,id',
            'area_id' => 'required|exists:areas,id',
            'start_date' => 'date_format:Y-m-d',
            'end_date' => 'date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'length' => 'required|integer',
            'max' => 'required|integer',
            'min' => 'required|integer',
            'week_days' => 'array',
            'status' => 'required',
            'min_time_before' => 'required|integer',
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
            'end_date' => $request->has('end_date') ? $request->end_date : null,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'length' => $request->length,
            'max' => $request->max,
            'min' => $request->min,
            'week_days' => $request->has('week_days') ? $request->week_days : [],
            'status' => $request->status,
            'booking_limits' => $request->booking_limits,
            'min_time_before' => $request->min_time_before,
            'future_booking_limit' => $request->future_booking_limit,
        ]);

        Log::add($request,'change-timetable','Changed timetable #'.$id);

        if($res){
            $timetable = Timetable::find($id);
            return response()->json($timetable);
        }else{
            return response()->json(['message' => 'Timetable not updated'],400);
        }
    }

    public function delete($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $timetable = Timetable::find($id);

        if(!Auth::user()->places->contains($timetable->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'delete-tableplan','Deleted tableplan #'.$timetable->id);

        $timetable->delete();

        return response()->json(['message' => 'Timetable is deleted']);
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

    public function getAllByPlace($place_id, Request $request)
    {
        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $timetables = Timetable::where('place_id',$place_id)->get();

        return response()->json($timetables);
    }

    public function getWorkingByAreaAndDate($area_id, Request $request)
    {
        $request->validate([
            'date' => 'date_format:Y-m-d',
        ]);

        $working_hours = self::get_working_by_area_and_date($area_id, $request->date, true);
        return response()->json($working_hours);
    }

    public static function get_working_by_area_and_date($area_id, $date, $for_admin = false)
    {
        $area = Area::find($area_id);
        if(!$area) return [];
        $default_tableplan = $area->place->tableplans()->first();
        $date_arr = explode('-',$date);
        $without_year = $date_arr[1].'-'.$date_arr[2];
        $week_day = date('w',strtotime($date));

        $working = Timetable::where('area_id', $area_id)
            ->where(function ($query) use ($date,$without_year) {
                $query->where(function ($query) use ($date) {
                    $query->where(function ($query) use ($date) {
                        $query->whereDate('start_date', '<=', $date)
                            ->orWhereNull('start_date');
                    })->where(function ($query) use ($date) {
                        $query->whereDate('end_date', '>=', $date)
                            ->orWhereNull('end_date');
                    });
                })->orWhere(function ($query) use ($without_year) {
                    $query->where(function ($query) use ($without_year) {
                        $query->whereDate('start_date', '<=', '0004-'.$without_year)
                            ->orWhereNull('start_date');
                    })->where(function ($query) use ($without_year) {
                        $query->whereDate('end_date', '>=', '0004-'.$without_year)
                            ->orWhereNull('end_date');
                    });
                });
            })->where('status', 'working')
            ->get();

        $non_working = Timetable::where('area_id', $area_id)
            ->where(function ($query) use ($date,$without_year) {
                $query->where(function ($query) use ($date) {
                    $query->where(function ($query) use ($date) {
                        $query->whereDate('start_date', '<=', $date)
                            ->orWhereNull('start_date');
                    })->where(function ($query) use ($date) {
                        $query->whereDate('end_date', '>=', $date)
                            ->orWhereNull('end_date');
                    });
                })->orWhere(function ($query) use ($without_year) {
                    $query->where(function ($query) use ($without_year) {
                        $query->whereDate('start_date', '<=', '0004-'.$without_year)
                            ->orWhereNull('start_date');
                    })->where(function ($query) use ($without_year) {
                        $query->whereDate('end_date', '>=', '0004-'.$without_year)
                            ->orWhereNull('end_date');
                    });
                });
            })->where('status','non-working')
            ->get();

        $working_hours = [];

        foreach ($working as $item){
            if($item->future_booking_limit && Carbon::now()->addDays($item->future_booking_limit)->lt(Carbon::parse($date))) return [];
            if(empty($item->week_days) || in_array($week_day,$item->week_days)){
                $working_hours[] = [
                    'date' => $date,
                    'from' => $item->start_time,
                    'to' => $item->end_time,
                    'tableplan_id' => $item->tableplan_id ?? $default_tableplan->id,
                    'booking_limits' => $item->booking_limits,
                    'length' => $item->length,
                    'min_time_before' => $item->min_time_before,
                    'max' => $item->max
                ];
            }
        }

        if(!$for_admin){
            foreach ($non_working as $item) {
                if(empty($item->week_days) || in_array($week_day,$item->week_days)){
                    if ($item->start_time == '00:00:00' && $item->end_time == '00:00:00') {
                        $working_hours = [];
                        break;
                    }else{
                        $working_hours = self::divideTimePeriod($working_hours,$item);
                    }
                }
            }
        }

        if(empty($working_hours) && $for_admin){
            $working_hours[] = [
                'date' => $date,
                'from' => '00:00:00',
                'to' => '23:59:59',
                'tableplan_id' => $default_tableplan->id,
                'booking_limits' => [],
                'length' => 0,
                'min_time_before' => 0,
                'max' => 999
            ];
        }


//        TODO: згрупувати діапазони, якщо в них однакові плани і час пересікається
//         Якщо час не накладається то нічого не робити
//        Якщо накладається, і різні столи, то перший закінчується коли починається інший
//        Якщо накладається, і столи однакові, то перший об'єднується з іншим
//      Якщо буде повторів правил більше ніж 2, тоді можна прописати цикл mergeTimePeriod поки кількість $working_hours старого не буде = кількості $working_hours нового.
//        $working_hours = self::mergeTimePeriod($working_hours);

        return $working_hours;
    }

    private static function divideTimePeriod($working_hours,$item)
    {
        $w_h = [];
        foreach ($working_hours as $index => $hours){
            if($hours['from'] >= $item->start_time && $hours['to'] <= $item->end_time){
//                nothing
            }elseif($hours['from'] > $item->start_time && $hours['to'] > $item->end_time && $item->end_time > $hours['from']){
                $w_h[] = array_merge($hours,[
                    'from' => $item->end_time,
                    'to' => $hours['to']
                ]);
            }elseif($hours['from'] < $item->start_time && $hours['to'] < $item->end_time && $item->start_time < $hours['to']){
                $w_h[] = array_merge($hours,[
                    'from' => $hours['from'],
                    'to' => $item->start_time
                ]);
            }elseif($hours['from'] < $item->start_time && $hours['to'] > $item->end_time){
                $w_h[] = array_merge($hours,[
                    'from' => $hours['from'],
                    'to' => $item->start_time
                ]);
                $w_h[] = array_merge($hours,[
                    'from' => $item->end_time,
                    'to' => $hours['to']
                ]);
            }else{
                $w_h[] = $hours;
            }
        }
        return $w_h;
    }

    private static function mergeTimePeriod($working_hours)
    {
        $w_h = [];
        foreach ($working_hours as $index1 => $item1){
            foreach ($working_hours as $index2 => $item2){
                if($index1 == $index2) continue;
                if($item1['to'] <= $item2['from'] || $item1['from'] >= $item2['to']){
//                    $w_h[] = $item1;
                }else{
                    if($item1['tableplan_id'] == $item2['tableplan_id']){
                        $w_h[] = [
                            'from' => min($item1['from'],$item2['from']),
                            'to' => max($item1['to'],$item2['to']),
                            'tableplan_id' => $item1['tableplan_id']
                        ];
                    }else{
                        if($item1['from'] > $item2['from'] && $item1['to'] > $item2['to']){
                            $w_h[] = [
                                'from' => $item2['to'],
                                'to' => $item1['to'],
                                'tableplan_id' => $item1['tableplan_id']
                            ];
                        }elseif($item1['from'] < $item2['from'] && $item1['to'] < $item2['to']){
                            $w_h[] = [
                                'from' => $item1['from'],
                                'to' => $item2['from'],
                                'tableplan_id' => $item1['tableplan_id']
                            ];
                        }elseif($item1['from'] < $item2['from'] && $item1['to'] > $item2['to']){
                            $w_h[] = [
                                'from' => $item1['from'],
                                'to' => $item2['from'],
                                'tableplan_id' => $item1['tableplan_id']
                            ];
                            $w_h[] = [
                                'from' => $item2['to'],
                                'to' => $item1['to'],
                                'tableplan_id' => $item1['tableplan_id']
                            ];
                        }
                        $w_h[] = $item2;
                    }
                }
            }
        }
        return array_unique($w_h,SORT_REGULAR);
    }

    public function stop_booking(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'date' => 'date_format:Y-m-d',
            'start_time' => 'date_format:H:i:s',
            'end_time' => 'date_format:H:i:s'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $timetable = Timetable::where('place_id',$request->place_id)
            ->where('area_id',$request->area_id)
            ->where('start_date',$request->date)
            ->where('end_date',$request->date)
            ->where('start_time',$request->start_time)
            ->where('end_time',$request->end_time)
            ->where('status','non-working')
            ->first();

        if(!$timetable){
            $timetable = Timetable::create([
                'place_id' => $request->place_id,
                'area_id' => $request->area_id,
                'start_date' => $request->date,
                'end_date' => $request->date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'non-working',
                'length' => 0,
                'max' => 999,
                'min' => 0,
                'booking_limits' => [],
                'min_time_before' => 120
            ]);

            Log::add($request,'stop-booking','Created timetable #'.$timetable->id);

            return response()->json($timetable);
        }else{
            return response()->json(['result' => 'ok']);
        }
    }

    public function unblock_booking(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'date' => 'date_format:Y-m-d',
            'start_time' => 'date_format:H:i:s',
            'end_time' => 'date_format:H:i:s'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $timetable = Timetable::where('place_id',$request->place_id)
            ->where('area_id',$request->area_id)
            ->where('start_date',$request->date)
            ->where('end_date',$request->date)
            ->where('start_time',$request->start_time)
            ->where('end_time',$request->end_time)
            ->where('status','non-working')
            ->first();

        if($timetable) {
            Log::add($request, 'unblock-booking', 'Deleted tableplan #' . $timetable->id);
            $timetable->delete();
        }
        return response()->json(['result' => 'ok']);
    }

    public function is_booking_stopped(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'area_id' => 'required|exists:areas,id',
            'date' => 'date_format:Y-m-d',
            'start_time' => 'date_format:H:i:s',
            'end_time' => 'date_format:H:i:s'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $timetable = Timetable::where('place_id',$request->place_id)
            ->where('area_id',$request->area_id)
            ->where('start_date',$request->date)
            ->where('end_date',$request->date)
            ->where('start_time',$request->start_time) // 00:00:00
            ->where('end_time',$request->end_time) // 00:00:00
            ->where('status','non-working')
            ->first();

        if(!$timetable){
            return response()->json(['result' => false]);
        }else{
            return response()->json(['result' => true]);
        }
    }
}
