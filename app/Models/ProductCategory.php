<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * @property integer $id
 * @property integer $place_id
 * @property string $name
 * @property string $image
 * @property integer $parent_id
 * @property integer $position
 *
 * @property Place $place
 * @property Collection<Product> $products
 * @property ProductCategory|null $parent
 * @property Collection<ProductCategory> $children
 * @method static ProductCategory create(array $array)
 * @method static ProductCategory|null find(string $categoryId)
 */
class ProductCategory extends Model
{
    use HasFactory;

    protected $guarded = [];

//    protected $with = ['parent'];

    protected $appends = [
        'image_url'
    ];

    public static function boot()
    {
        parent::boot();

        self::created(function($model){
            $model->path = ($model->parent_id ? $model->parent->path : 0).'.'.$model->id;
            $model->saveQuietly();
        });

        self::updated(function($model){
            $model->path = ($model->parent_id ? $model->parent->path : 0).'.'.$model->id;
            $model->saveQuietly();
            if($model->children->count()){
                foreach ($model->children as $child){
                    $child->path = ($child->parent_id ? $child->parent->path : 0).'.'.$child->id;
                    $child->save();
                }
            }
        });
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('position');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class,'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(ProductCategory::class,'parent_id');
    }

    public function getImageUrlAttribute(): string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : '';
    }
}
