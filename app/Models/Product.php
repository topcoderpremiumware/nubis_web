<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * @property integer $id
 * @property integer $place_id
 * @property integer $product_category_id
 * @property string $name
 * @property string $image
 * @property float $cost_price
 * @property float $selling_price
 * @property integer $stock
 * @property float $tax
 * @property Carbon $deleted_at
 *
 * @property Place $place
 * @property ProductCategory $product_category
 * @property Collection<Check> $checks
 */
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $appends = [
        'image_url'
    ];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function product_category()
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function checks()
    {
        return $this->belongsToMany(Check::class);
    }

    public function getImageUrlAttribute(): string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : '';
    }
}
