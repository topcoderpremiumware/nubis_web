<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * @property integer $id
 * @property integer $place_id
 * @property string $name
 * @property string $image
 * @property float $cost_price
 * @property float $selling_price
 * @property integer $stock
 * @property float $tax
 * @property Carbon $deleted_at
 *
 * @property Place $place
 * @property Collection<ProductCategory> $product_categories
 * @property Collection<Check> $checks
 * @method static Product create(array $array)
 */
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

//    protected $with = ['product_categories'];

    protected $appends = [
        'image_url'
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function product_categories(): BelongsToMany
    {
        return $this->belongsToMany(ProductCategory::class)
            ->withPivot('position');
    }

    public function checks(): BelongsToMany
    {
        return $this->belongsToMany(Check::class)
            ->withPivot('price', 'quantity');
    }

    public function getImageUrlAttribute(): string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : '';
    }
}
