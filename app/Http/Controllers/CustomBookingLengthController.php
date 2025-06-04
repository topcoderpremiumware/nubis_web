<?php

namespace App\Http\Controllers;

use App\Models\CustomBookingLength;
use App\Models\Log;
use App\Models\Order;
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
            'min_time_before' => 'required|integer',
        ]);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
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
            'min_time_before' => $request->min_time_before,
            'is_overwrite' => $request->is_overwrite,
            'payment_settings' => $request->payment_settings
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
            'min_time_before' => 'required|integer',
        ]);

        $custom_booking_length = CustomBookingLength::find($id);

        if(!Auth::user()->is_superadmin && (!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($custom_booking_length->place_id))){
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

        if(($custom_booking_length->image && $filename && $custom_booking_length->image != $filename) || $request->has('remove_image')){
            Storage::disk('public')->delete($custom_booking_length->image);
        }

        if($request->has('remove_image')){
            $custom_booking_length->image = null;
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
            'min_time_before' => $request->min_time_before,
            'is_overwrite' => $request->is_overwrite,
            'payment_settings' => $request->payment_settings
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

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($custom_booking_length->place_id)){
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

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($custom_booking_length->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($custom_booking_length);
    }

    public function getAllByPlace($place_id, Request $request)
    {
        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($place_id)){
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
        $place = \App\Models\Place::find($request->place_id);

        $request_date = Carbon::parse($request->reservation_date);
        if($request_date->lt($place->country->timeNow()->setTime(0,0,0))) return response()->json([
            'message' => 'Date must be today and later'
        ], 400);

        $working_hours = TimetableController::get_working_by_area_and_date($request->area_id,$request_date->format("Y-m-d"));
        if(empty($working_hours)) return response()->json([
            'message' => 'Non-working day'
        ], 400);

        $time_from = $request_date->copy();
        $time_from->setTime(0, 0, 0);
        $time_to = $request_date->copy();
        $time_to->setTime(23, 59, 59);
        $orders = Order::where('place_id',$request->place_id)
            ->where('area_id',$request->area_id)
            ->whereBetween('reservation_time',[$time_from,$time_to])
            ->where('is_take_away',0)
            ->whereIn('status',['confirmed','arrived','pending'])
            ->get();

        $free_tables = (new OrderController())->getFreeTables($orders, $working_hours, $request->seats, false);

        $custom_lengths = CustomBookingLength::where('place_id',$request->place_id)
            ->whereHas('areas', function ($q) use ($request){
                $q->where('areas.id', $request->area_id);
            })
            ->where('is_overwrite',1)
            ->where('active', 1)
            ->where('start_date', '<=', $request->reservation_date)
            ->where('end_date', '>=', $request->reservation_date)
            ->where('max', '>=', $request->seats)
            ->where('min', '<=', $request->seats)
            ->orderBy('priority', 'desc')
            ->get();

        if(!$custom_lengths || count($custom_lengths) == 0){
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
        }

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
            $logs = [];
            $logs['free_tables'] = $free_tables;
            $logs['working_hours'] = $working_hours;
            $logs['orders'] = $orders;
            $logs['tables'] = [];
            foreach ($custom_length->time_intervals as $time_interval) {
                $time = Carbon::parse($request->reservation_date . ' ' . $time_interval['from']);
                $end = Carbon::parse($request->reservation_date . ' ' . $time_interval['to']);
                for ($time; $time->lt($end); $time->addMinutes(15)) {
                    if($time->lt($place->country->timeNow()->addMinutes($custom_length->min_time_before))) continue;
                    $working_hour = array_values(array_filter($working_hours,function($item) use ($time) {
                        return $item['from'] <= $time->format('H:i:s') && $item['to'] > $time->format('H:i:s');
                    }));
                    if(count($working_hour) > 0){
                        $working_hour = $working_hour[0];
                    }else{
                        continue;
                    }
                    $indexFrom = intval($time->format('H'))*4 + floor(intval($time->format('i'))/15);

                    if(array_key_exists('booking_limits', $working_hour) && is_array($working_hour['booking_limits']) &&
                        array_key_exists($indexFrom, $working_hour['booking_limits'])){
                        $timeOrders_seats = 0;
                        $timeOrders = Order::where('place_id',$request->place_id)
                            ->where('area_id',$request->area_id)
                            ->where('reservation_time',$time->format('Y-m-d H:i:s'))
                            ->where('is_take_away',0)
                            ->whereIn('status',['confirmed','arrived','pending'])
                            ->get();
                        foreach ($timeOrders as $timeOrder) {
                            $timeOrders_seats += $timeOrder->seats;
                        }

                        $booking_limits = $working_hour['booking_limits'][$indexFrom];
                        $is_max_seats = $booking_limits['max_seats'] == 0 || $booking_limits['max_seats'] >= $timeOrders_seats+$request->seats;
                        $is_max_books = $booking_limits['max_books'] == 0 || $booking_limits['max_books'] >= count($timeOrders)+1;

                        if(!$is_max_seats || !$is_max_books) continue;
                    }

                    foreach ($free_tables as $tables) {
                        foreach ($tables as $table) {
                            if(!array_key_exists('seats',$table)) continue;
                            if($table['seats'] < $request->seats) continue;
                            if($table['time'][0]['min_seats'] > 0 && $table['time'][0]['min_seats'] > $request->seats) continue;
                            if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                                $reserv_to = $time->copy()->addMinutes($custom_length->length);
                                $reserv_from = $time->copy();

                                for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                                    $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
                                    if(array_key_exists('ordered', $table['time'][$i])){
                                        continue 2;
                                    }
                                }
                                $logs[$time->copy()->toString()] = $table['number'];
                                $logs['tables'][$table['number']] = $table;
                                array_push($times,$time->copy());
                                break 2;
                            }
                        }
                        $groups_table_seats = [];
                        $groups_tables = [];
                        foreach ($tables as $table) {
                            if($table['time'][0]['min_seats'] > 0 && $table['time'][0]['min_seats'] > $request->seats) continue;
                            if(!array_key_exists('grouped',$table)) continue;
                            if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                                $group_id = $table['time'][0]['group'];
                                $reserv_to = $time->copy()->addMinutes($custom_length->length);
                                $reserv_from = $time->copy();

                                for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                                    $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
                                    if(array_key_exists('ordered', $table['time'][$i])){
                                        continue 2;
                                    }
                                }

                                if(!array_key_exists($group_id, $groups_table_seats)) $groups_table_seats[$group_id] = 0;
                                $groups_table_seats[$group_id] += $table['seats'];
                                $groups_tables[$group_id][] = $table['number'];
                                if($groups_table_seats[$group_id] >= $request->seats){
                                    $logs[$time->copy()->toString().' g'] = json_encode($groups_tables[$group_id]).', group_seats='.$groups_table_seats[$group_id].', order_seats='.$request->seats;
                                    array_push($times,$time->copy());
                                    break 2;
                                }
                            }
                        }
                    }

                }
            }
            $times = array_values(array_unique($times));

            if(count($times) > 0){
                array_push($lengths_data,[
                    'id' => $custom_length->id,
                    'name' => $custom_length->labels[$request->language]['name'],
                    'description' => $custom_length->labels[$request->language]['description'],
                    'image' => $custom_length->image ? Storage::disk('public')->url($custom_length->image) : '',
                    'length' => intval($custom_length->length)+intval($custom_length->preparation_length),
                    'time' => $times,
                    'logs' => $logs,
                    'payment_settings' => $custom_length->payment_settings,
                ]);
            }
        }

        return response()->json($lengths_data);
    }
}
