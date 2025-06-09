<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * @property integer $id
 * @property integer $place_id
 * @property string $name
 * @property integer $length
 * @property bool $active
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property integer $max
 * @property integer $min
 * @property integer $priority
 * @property array $labels
 * @property array $month_days
 * @property array $week_days
 * @property array $spec_dates
 * @property array $time_intervals
 * @property string $image
 * @property integer $preparation_length
 * @property integer $min_time_before
 * @property array $payment_settings
 * @property bool $is_overwrite
 * @property float $price
 *
 * @property Place $place
 * @property Collection<Area> $areas
 * @property Collection<Course> $courses
 * @property array $area_ids
 * @property string $image_url
 */

class CustomBookingLength extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['area_ids','image_url'];

    protected $with = ['courses'];

    protected $casts = [
        'max' => 'integer',
        'min' => 'integer',
        'priority' => 'integer',
        'labels' => 'array',
        'month_days' => 'array',
        'week_days' => 'array', //0 - sunday..6 - saturday
        'spec_dates' => 'array',
        'time_intervals' => 'array',
        'payment_settings' =>  'array',
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function getAreaIdsAttribute()
    {
        return $this->areas()->pluck('area_id');
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? Storage::disk('public')->url($this->image) : null;
    }

    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class);
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }
}
