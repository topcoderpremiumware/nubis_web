<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $id
 * @property integer $customer_id
 * @property integer $place_id
 * @property integer $tableplan_id
 * @property integer $area_id
 * @property array $table_ids
 * @property integer $seats
 * @property Carbon $reservation_time
 * @property string $comment
 * @property string $status
 * @property bool $is_take_away
 * @property string $source
 * @property array $marks
 * @property Carbon $deleted_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property integer $length
 * @property integer $custom_booking_length_id
 * @property integer $user_id
 * @property string $first_name
 * @property string $last_name
 * @property string $email
 * @property string $phone
 *
 * @property Place $place
 * @property CustomBookingLength $custom_booking_length
 * @method static Order find(mixed $order_id)
 */
class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    const STATUSES = [
            'waiting', // in the waiting list
            'pending', // order created but not paid
            'confirmed', // order paid
            'no_show', // customer no shown
            'arrived', // customer arrived to place
            'completed', // order is finished
        ];

    protected $casts = [
        'table_ids' => 'array',
        'marks' => 'array',
        'reservation_time' => 'datetime'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function tableplan(): BelongsTo
    {
        return $this->belongsTo(Tableplan::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    public function custom_booking_length(): BelongsTo
    {
        return $this->belongsTo(CustomBookingLength::class);
    }

    public function refundGiftcard()
    {
        $discount = floatval($this->marks['amountWithoutDiscount']) - floatval($this->marks['amount']);
        $giftcard = Giftcard::where('code',$this->marks['giftcard_code'])
            ->first();
        if($giftcard){
            $giftcard->refund($discount);
        }
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class,'user_id');
    }
}
