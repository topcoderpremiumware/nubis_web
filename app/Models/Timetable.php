<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $place_id
 * @property integer $tableplan_id
 * @property integer $area_id
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property string $start_time
 * @property string $end_time
 * @property integer $length
 * @property integer $max
 * @property integer $min
 * @property array $week_days
 * @property string $status
 * @property array $booking_limits
 * @property integer $min_time_before
 * @property integer $future_booking_limit
 * @property boolean $is_take_away
 *
 * @property Place $place
 * @property Tableplan $tableplan
 * @property Area $area
 *
 */

class Timetable extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'week_days' => 'array', //0 - sunday..6 - saturday
        'booking_limits' => 'array',
    ];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function tableplan()
    {
        return $this->belongsTo(Tableplan::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }
}
