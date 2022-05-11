<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timetable extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'week_days' => 'array', //0 - sunday..6 - saturday
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
