<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * @property integer $id
 * @property integer $place_id
 * @property string $name
 * @property string $image
 * @property array $labels
 * @property boolean $active
 * @property float $price
 *
 * @property Place $place
 * @property string $url
 * @method GiftcardMenu|null find($id)
 */
class GiftcardMenu extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = [
        'image_url'
    ];

    protected $casts = [
        'labels' => 'array',
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function getImageUrlAttribute(): string|null
    {
        return $this->image ? Storage::disk('public')->url($this->image) : null;
    }
}
