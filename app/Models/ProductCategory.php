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
 * @property integer $parent_id
 *
 * @property Place $place
 * @property Collection<Product> $products
 * @property ProductCategory|null $parent
 */
class ProductCategory extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $with = ['parent'];

    protected $appends = [
        'image_url'
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class,'parent_id');
    }

    public function getImageUrlAttribute(): string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : '';
    }
}
