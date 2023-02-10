<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Log;
use App\Models\Tableplan;
use App\Models\Timetable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            'end_date' => $request->has('end_date') ? $request->end_date : null,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'length' => $request->length,
            'max' => $request->max,
            'min' => $request->min,
            'week_days' => $request->has('week_days') ? $request->week_days : [],
            'status' => $request->status,
            'booking_limits' => $request->booking_limits
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
            'end_date' => $request->has('end_date') ? $request->end_date : null,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'length' => $request->length,
            'max' => $request->max,
            'min' => $request->min,
            'week_days' => $request->has('week_days') ? $request->week_days : [],
            'status' => $request->status,
            'booking_limits' => $request->booking_limits
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

        $working_hours = self::get_working_by_area_and_date($area_id, $request->date);
        return response()->json($working_hours);
    }

    public static function get_working_by_area_and_date($area_id, $date)
    {
        $area = Area::find($area_id);
        $default_tableplan = $area->place->timetables()->first();
        $date_arr = explode('-',$date);
        $without_year = $date_arr[1].'-'.$date_arr[2];
        $week_day = date('w',strtotime($date));

        $working = Timetable::where('area_id',$area_id)
            ->where(function($q) use ($date,$without_year){
                $q->whereDate('start_date','<=',$date)
                    ->orWhereNull('start_date')
                    ->orWhereDate('start_date','<=','0004-'.$without_year);
            })
            ->where(function($q) use ($date,$without_year){
                $q->whereDate('end_date','>=',$date)
                    ->orWhereNull('end_date')
                    ->orWhereDate('end_date','>=','0004-'.$without_year);
            })
            ->where('status','working')
            ->get();

        $non_working = Timetable::where('area_id',$area_id)
            ->where(function($q) use ($date,$without_year){
                $q->whereDate('start_date','<=',$date)
                    ->orWhereNull('start_date')
                    ->orWhereDate('start_date','<=','0004-'.$without_year);
            })
            ->where(function($q) use ($date,$without_year){
                $q->whereDate('end_date','>=',$date)
                    ->orWhereNull('end_date')
                    ->orWhereDate('end_date','>=','0004-'.$without_year);
            })
            ->where('status','non-working')
            ->get();

        $working_hours = [];

        foreach ($working as $item){
            if(empty($item->week_days) || in_array($week_day,$item->week_days)){
                array_push($working_hours,[
                    'from' => $item->start_time,
                    'to' => $item->end_time,
                    'tableplan_id' => $item->tableplan_id ?? $default_tableplan->id,
                    'booking_limits' => $item->booking_limits
                ]);
            }
        }

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
            }elseif($hours['from'] > $item->start_time && $hours['to'] > $item->end_time){
                $w_h[] = [
                    'from' => $item->end_time,
                    'to' => $hours['to'],
                    'tableplan_id' => $hours['tableplan_id'],
                    'booking_limits' => $hours['booking_limits']
                ];
            }elseif($hours['from'] < $item->start_time && $hours['to'] < $item->end_time){
                $w_h[] = [
                    'from' => $hours['from'],
                    'to' => $item->start_time,
                    'tableplan_id' => $hours['tableplan_id'],
                    'booking_limits' => $hours['booking_limits']
                ];
            }elseif($hours['from'] < $item->start_time && $hours['to'] > $item->end_time){
                $w_h[] = [
                    'from' => $hours['from'],
                    'to' => $item->start_time,
                    'tableplan_id' => $hours['tableplan_id'],
                    'booking_limits' => $hours['booking_limits']
                ];
                $w_h[] = [
                    'from' => $item->end_time,
                    'to' => $hours['to'],
                    'tableplan_id' => $hours['tableplan_id'],
                    'booking_limits' => $hours['booking_limits']
                ];
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
}
