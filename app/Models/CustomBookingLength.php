<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomBookingLength extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['area_ids'];

    protected $casts = [
        'max' => 'integer',
        'min' => 'integer',
        'priority' => 'integer',
        'labels' => 'array',
        'month_days' => 'array',
        'week_days' => 'array', //0 - sunday..6 - saturday
        'spec_dates' => 'array',
        'time_intervals' => 'array'
    ];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function getAreaIdsAttribute()
    {
        return $this->areas()->pluck('area_id');
    }

    public function areas()
    {
        return $this->belongsToMany(Area::class);
    }
}
