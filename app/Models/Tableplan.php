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

    public function getTables()
    {
        return array_filter($this->data,function($el){
            return array_key_exists('number',$el);
        });
    }

    public function getTableGroups()
    {
        $tables = $this->getTables();
        $groups = [];
        foreach ($tables as $table) {
            $table['grouped'] = 1;
            $group_id = $table['time'][0]['group'];
            if(array_key_exists($group_id,$groups)){
                $groups[$group_id]['seats'] += $table['seats'];
                $groups[$group_id]['tables'][] = $table;
            }else{
                $groups[$group_id] = [
                    'is_internal' => $table['time'][0]['is_internal'],
                    'is_online' => $table['time'][0]['is_online'],
                    'group_priority' => $table['time'][0]['group_priority'],
                    'seats' => $table['seats'],
                    'tables' => [$table]
                ];
            }
        }
        return $groups;
    }
}
