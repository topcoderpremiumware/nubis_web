<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
