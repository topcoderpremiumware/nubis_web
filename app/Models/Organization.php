<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function places()
    {
        return $this->hasMany(Place::class);
    }

    public function paid_bills()
    {
        return $this->hasMany(PaidBill::class);
    }

}
