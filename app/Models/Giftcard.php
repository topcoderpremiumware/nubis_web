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
}
