<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    const STATUSES = [
            'waiting', // in the waiting list
            'pending', // order created but not paid
            'confirmed', // order paid
            'arrived', // customer arrived to place
            'completed', // order is finished
        ];

    protected $casts = [
        'table_ids' => 'array',
        'marks' => 'array',
        'reservation_time' => 'datetime'
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

    public function custom_booking_length()
    {
        return $this->belongsTo(CustomBookingLength::class);
    }
}
