<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

/**
 * @property integer $id
 * @property integer $place_id
 * @property string $name
 * @property integer $priority
 * @property bool $online_available
 * @property array $labels
 * @property Carbon $deleted_at
 *
 * @property Place $place
 * @property Collection<Timetable> $timetables
 * @property Collection<Order> $orders
 * @property Collection<CustomBookingLength> $custom_booking_lengths
 */
class Area extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'priority' => 'integer',
        'labels' => 'array',
    ];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function custom_booking_lengths()
    {
        return $this->belongsToMany(CustomBookingLength::class);
    }
}
