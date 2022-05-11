<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'table_ids' => 'array',
        'marks' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function tableplan()
    {
        return $this->belongsTo(Tableplan::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }
}
