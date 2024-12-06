<?php

namespace App\Models;

use App\Jobs\SignCheck;
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
 * @property string $status // open, closed, refund
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
 * @property string $signature_data
 * @property string $signature
 * @property string $key_version
 * @property integer $place_check_id
 * @property string $certificate
 * @property array $bank_log
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

    protected $casts = [
        'deleted_at' => 'datetime',
        'printed_at' => 'datetime',
        'bank_log' => 'array'
    ];

    public static function boot(): void
    {
        parent::boot();
        self::created(function ($model) {
            if($model->status === 'refund' && !$model->place_check_id){
                $last_check = Check::where('place_id', $model->place_id)
                    ->orderBy('place_check_id', 'desc')
                    ->first();
                $model->place_check_id = $last_check ? $last_check->place_check_id + 1 : 1;
                $model->saveQuietly();
                dispatch(new SignCheck($model->id));
            }
        });

        self::updated(function($model){
            if($model->status === 'closed' && !$model->place_check_id){
                $last_check = Check::where('place_id', $model->place_id)
                    ->orderBy('place_check_id', 'desc')
                    ->first();
                $model->place_check_id = $last_check ? $last_check->place_check_id + 1 : 1;
                $model->saveQuietly();
                dispatch(new SignCheck($model->id));
            }
        });
    }

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
            ->withPivot('price', 'quantity', 'is_printed')->withTrashed();
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
