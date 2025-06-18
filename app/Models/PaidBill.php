<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $place_id
 * @property float $amount
 * @property string $currency
 * @property Carbon $payment_date
 * @property string $product_name
 * @property integer $duration
 * @property Carbon $expired_at
 * @property string $payment_intent_id
 * @property string $receipt_url
 * @property string $category // full, booking, pos, pos_terminal, giftcards, take_away
 *
 * @property Place $place
 * @method static PaidBill|null find($id)
 */
class PaidBill extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
