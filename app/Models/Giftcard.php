<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Giftcard extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = [
        'url'
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
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
}
