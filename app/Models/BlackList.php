<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * @property integer $id
 * @property integer $place_id
 * @property integer $customer_id
 *
 * @property Place $place
 * @property Customer $customer
 */
class BlackList extends Authenticatable
{
    protected $guarded = [];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
