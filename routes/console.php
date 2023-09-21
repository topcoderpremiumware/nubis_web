<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('time_migration', function () {
//    $places = \App\Models\Place::all();
//    foreach ($places as $place) {
//        foreach ($place->custom_booking_lengths as $item) {
//            $new_interval = [];
//            foreach ($item->time_intervals as $time_interval) {
//                $new_interval[] = [
//                    'from' => \Carbon\Carbon::parse($time_interval['from'])
//                        ->timezone($place->country->timezone)->format('H:i:s'),
//                    'to' => \Carbon\Carbon::parse($time_interval['to'])
//                        ->timezone($place->country->timezone)->format('H:i:s')
//                ];
//            }
//            $item->time_intervals = $new_interval;
//            $item->save();
//        }
//        foreach ($place->orders as $order) {
//            $order->reservation_time = \Carbon\Carbon::parse($order->reservation_time)
//                ->timezone($place->country->timezone)->format('Y-m-d H:i:s');
//            $order->save();
//        }
//        foreach ($place->timetables as $timetable) {
//            $timetable->start_time = \Carbon\Carbon::parse($timetable->start_time)
//                ->timezone($place->country->timezone)->format('Y-m-d H:i:s');
//            $timetable->end_time = \Carbon\Carbon::parse($timetable->end_time)
//                ->timezone($place->country->timezone)->format('Y-m-d H:i:s');
//            $timetable->save();
//        }
//    }
})->purpose('Migrate time');
