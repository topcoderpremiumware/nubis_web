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
        $tables = array_filter($this->data,function($el){
            return array_key_exists('number',$el);
        });

        usort($tables,function($a, $b){
            if ($a['time'][0]['priority'] == $b['time'][0]['priority']) return 0;
            return ($a['time'][0]['priority'] < $b['time'][0]['priority']) ? -1 : 1;
        });

        return $tables;
    }

    public function getTableGroups()
    {
        $tables = $this->getTables();
        $groups = [];
        foreach ($tables as $table) {
            $group_id = $table['time'][0]['group'];
            if($group_id == 0) continue;
            $table['grouped'] = 1;
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

        usort($groups,function($a, $b){
            if ($a['group_priority'] == $b['group_priority']) return 0;
            return ($a['group_priority'] < $b['group_priority']) ? -1 : 1;
        });

        return $groups;
    }
}
