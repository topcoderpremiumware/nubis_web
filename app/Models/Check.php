<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

/**
 * @property integer $id
 * @property integer $place_id
 * @property integer $order_id
 * @property string $status // open, closed
 * @property float $total
 * @property float $discount
 * @property string $discount_type
 * @property string $discount_code
 * @property Carbon $deleted_at
 *
 * @property Place $place
 * @property Order $order
 * @property Collection<Product> $products
 */
class Check extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('price', 'quantity');
    }
}
