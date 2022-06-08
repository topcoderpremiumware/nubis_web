<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tableplan extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'data' => 'array',
    ];
/*
 "data":[
    {
        "seats":2,
        "number":1,
        "color":"#ff0000",
        "angle":90,
        "top":50,
        "left":40,
        "type":0,
        "qr_code":"",
        "time":[
            {
                "is_internal":true,
                "is_online":true,
                "priority":1,
                "min_seats":1,
                "group":1,
                "group_priority":1,
                "booking_length":0
            }
        ]
    }
]
 */

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
}
