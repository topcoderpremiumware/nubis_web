<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Giftcard extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function spend($amount)
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

    public static function getAmountByCode($code)
    {
        $giftcard = Giftcard::where('code',$code)
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
}
