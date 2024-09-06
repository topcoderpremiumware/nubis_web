<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

/**
 * @property integer $id
 * @property integer $place_id
 * @property string $name
 * @property string $code
 * @property Carbon $expired_at
 * @property float $initial_amount
 * @property float $spend_amount
 * @property string $company_name
 * @property string $company_address
 * @property string $post_code
 * @property string $company_city
 * @property string $vat_number
 * @property string $email
 * @property string $receiver_name
 * @property string $receiver_email
 * @property integer $country_id
 * @property string $status
 * @property string $filename
 * @property integer $giftcard_menu_id
 * @property string $background_image
 * @property string $greetings
 * @property bool $qty_together
 * @property integer $quantity
 * @property Carbon $deleted_at
 * @property string $delete_comment
 *
 * @property Place $place
 * @property Country $country
 * @property GiftcardMenu $giftcard_menu
 * @property string $url
 * @property string $background_image_url
 * @method Giftcard|null find($id)
 */
class Giftcard extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $appends = [
        'url',
        'background_image_url'
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function giftcard_menu(): BelongsTo
    {
        return $this->belongsTo(GiftcardMenu::class);
    }

    public function spend($amount): bool
    {
        $amount = floatval($amount);
        if($this->spend_amount + $amount <= $this->initial_amount){
            $this->spend_amount += $amount;
            $this->save();
            return true;
        }else{
            return false;
        }
    }

    public static function getAmountByCode($code,$place_id)
    {
        $giftcard = Giftcard::where('code',$code)
            ->where('place_id',$place_id)
            ->first();
        if($giftcard === null){
            return 0;
        }
        if($giftcard->expired_at <= now()){
            return 0;
        }
        if($giftcard->status != 'confirmed'){
            return 0;
        }
        if($giftcard->spend_amount >= $giftcard->initial_amount){
            return 0;
        }
        return $giftcard->initial_amount - $giftcard->spend_amount;
    }

    public static function generateUniqueCode()
    {
        $code = '';
        do {
            $code = str()->random(6);
        } while (Giftcard::where('code', $code)->exists());
        return $code;
    }

    public function refund($amount): bool
    {
        $amount = floatval($amount);
        if($this->spend_amount - $amount >= 0){
            $this->spend_amount -= $amount;
            $this->save();
            return true;
        }else{
            return false;
        }
    }

    public function getUrlAttribute(): string|null
    {
        return $this->filename ? Storage::disk('public')->url($this->filename) : null;
    }

    public function getBackgroundImageUrlAttribute(): string|null
    {
        return $this->filename ? Storage::disk('public')->url($this->background_image) : null;
    }
}
