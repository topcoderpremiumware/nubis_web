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
 * @property string $name
 * @property string discount_name
 * @property float $subtotal
 * @property string $payment_method // cash, card
 * @property Carbon $printed_at
 * @property integer $printed_id
 * @property float $cash_amount
 * @property float $card_amount
 * @property integer $parent_id
 * @property string $refund_description
 *
 * @property Place $place
 * @property Order $order
 * @property Collection<Product> $products
 * @property User $printed
 * @property Check $parent
 * @property Collection<Check> $refunds
 * @method static Check find($id)
 */
class Check extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class)->withTrashed();
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('price', 'quantity')->withTrashed();
    }

    public function printed(): BelongsTo
    {
        return $this->belongsTo(User::class, 'printed_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Check::class, 'parent_id');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Check::class,'parent_id');
    }
}
