<?php

namespace App\Jobs;

use App\Http\Controllers\OrderController;
use App\Http\Controllers\TimetableController;
use App\Models\Area;
use App\Models\Order;
use App\SMS\SMS;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TryChangeTableplanInOrders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $place_id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($place_id)
    {
       $this->place_id = $place_id;
    }

    /**
     *
     * 1) Знайти мінімальну і максимальну дату резервування від сьогодні ордерів
     * 2) Циклом від мінімальної до максимальної дати отримувати масив робочих годин (як в алгоритмі отримання робочого часу) і оредри на цю дату
     * 3) Порівнювати ордер з кожною робочою годиною, якщо відповідає робочий час і Зал, то повинен відповідати і tableplan
     * 4) якщо не відповідає, тоді треба за алгоритмом замовлення покупцем отримати відповідні tableplan і столи
     * 5) Якщо не знайшло відповідні - пропустити цей ордер
     * 6) Якщо знайшло відповідні - змінити tableplan_id і tables на нові.
     * @return void
     */
    public function handle()
    {
        $dates = Order::select(DB::raw('MAX(reservation_time) as max_date, MIN(reservation_time) as min_date'))
            ->where('place_id',$this->place_id)
            ->where('reservation_time', '>', now())
            ->where('is_take_away',0)
            ->whereIn('status',['confirmed','arrived','pending'])
            ->first();

        $areas = Area::where('place_id',$this->place_id)->get();

        for ($date = Carbon::parse($dates->min_date)->startOfDay(); $date->lte(Carbon::parse($dates->max_date)->startOfDay()); $date->addDay()) {
            $orders = Order::where('place_id',$this->place_id)
                ->whereBetween('reservation_time', [$date,$date->copy()->addDay()])
                ->where('is_take_away',0)
                ->whereIn('status',['confirmed','arrived','pending'])
                ->get();

            if($orders->count() > 0){
                foreach ($areas as $area) {
                    $working_hours = TimetableController::get_working_by_area_and_date($area->id, $date);
                    if(empty($working_hours)) continue;

                    foreach ($orders as $order) {
                        if($order->area_id !== $area->id) continue;
                        foreach ($working_hours as $working_hour) {
                            $from = Carbon::parse($working_hour['date']->format('Y-m-d').' '.$working_hour['from']);
                            $to = Carbon::parse($working_hour['date']->format('Y-m-d').' '.$working_hour['to']);
                            // if the order is out of timetable
                            if($order->reservation_time->gte($from) && $order->reservation_time->lte($to) &&
                                $order->tableplan_id !== $working_hour['tableplan_id']){
                                $test_orders = Order::where('place_id',$this->place_id)
                                    ->where('area_id',$area->id)
                                    ->whereBetween('reservation_time', [$date,$date->copy()->addDay()])
                                    ->where('is_take_away',0)
                                    ->whereIn('status',['confirmed','arrived','pending'])
                                    ->get();

                                $free_tables = app(OrderController::class)->getFreeTables($test_orders, $working_hours, $order->seats, false);
                                $tableplan_id = null;
                                $table_ids = [];
                                $indexFrom = intval($order->reservation_time->format('H'))*4 + floor(intval($order->reservation_time->format('i'))/15);
                                foreach ($free_tables as $plan_id => $tables){
                                    foreach ($tables as $table) {
                                        if($table['seats'] < $order->seats) continue;
                                        if($table['time'][0]['min_seats'] > 0 && $table['time'][0]['min_seats'] > $order->seats) continue;
                                        if (!array_key_exists('ordered', $table['time'][$indexFrom])) {
                                            $reserv_to = $order->reservation_time->copy()->addMinutes($order->length);
                                            $reserv_from = $order->reservation_time->copy();

                                            for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                                                $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
                                                if(array_key_exists('ordered', $table['time'][$i])){
                                                    continue 2;
                                                }
                                            }
                                            $table_ids = [$table['number']];
                                            $tableplan_id = $plan_id;
                                            break 2;
                                        }
                                    }

                                    $groups_table_ids = [];
                                    $groups_table_seats = [];
                                    foreach ($tables as $table) {
                                        if($table['time'][0]['min_seats'] > 0 && $table['time'][0]['min_seats'] > $order->seats) continue;
                                        if(!array_key_exists('grouped',$table)) continue;
                                        if(array_key_exists('ordered', $table['time'][$indexFrom])) continue;
                                        $reserv_to = $order->reservation_time->copy()->addMinutes($order->length);
                                        $reserv_from = $order->reservation_time->copy();

                                        for ($reserv_from; $reserv_from->lt($reserv_to); $reserv_from->addMinutes(15)) {
                                            $i = intval($reserv_from->format('H'))*4 + floor(intval($reserv_from->format('i'))/15);
                                            if(array_key_exists('ordered', $table['time'][$i])){
                                                continue 2;
                                            }
                                        }
                                        $group_id = $table['time'][0]['group'];
                                        $groups_table_ids[$group_id][] = $table['number'];
                                        if(!array_key_exists($group_id, $groups_table_seats)) $groups_table_seats[$group_id] = 0;
                                        $groups_table_seats[$group_id] += $table['seats'];
                                        if($groups_table_seats[$group_id] >= $order->seats){
                                            $table_ids = $groups_table_ids[$group_id];
                                            $tableplan_id = $plan_id;
                                            break 2;
                                        }
                                    }
                                }
                                if(!empty($table_ids)){
                                    $order->tableplan_id = $tableplan_id;
                                    $order->table_ids = $table_ids;
                                    $order->save();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
