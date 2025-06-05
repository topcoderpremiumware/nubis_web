<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

/**
 * @property integer $id
 * @property integer $custom_booking_length_id
 * @property string $name
 *
 * @property Collection<CustomBookingLength> $custom_booking_lengths
 * @property Collection<Product> $products
 */
class Course extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'priority' => 'integer',
        'labels' => 'array',
    ];

    protected $with = ['products'];

    public function custom_booking_lengths()
    {
        return $this->belongsToMany(CustomBookingLength::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }
}
