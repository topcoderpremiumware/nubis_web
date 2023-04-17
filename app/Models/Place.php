<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Place extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $with = ['country'];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function tableplans()
    {
        return $this->hasMany(Tableplan::class);
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class);
    }

    public function areas()
    {
        return $this->hasMany(Area::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function menus()
    {
        return $this->hasMany(Menu::class);
    }

    public function message_templates()
    {
        return $this->hasMany(MessageTemplate::class);
    }

    public function giftcards()
    {
        return $this->hasMany(Giftcard::class);
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }

    public function settings()
    {
        return $this->hasMany(Setting::class);
    }

    public function setting($name)
    {
        $setting = $this->settings()->where('name',$name)->first();
        if($setting){
            return $setting->value;
        }else{
            return null;
        }
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function paid_bills()
    {
        return $this->hasMany(PaidBill::class);
    }

    public function is_bill_paid()
    {
        $bill = $this->paid_bills()->orderByDesc('expired_at')->first();
        if(!$bill) return false;
        return $bill->expired_at > \Carbon\Carbon::now();
    }

    public function admins()
    {
        $admins = collect([]);
        foreach ($this->users as $user) {
            if($user->hasRole('admin',$this->id)){
                $admins->push($user);
            }
        }
        return $admins;
    }

    public function waiters()
    {
        $admins = collect([]);
        foreach ($this->users as $user) {
            if($user->hasRole('waiter',$this->id)){
                $admins->push($user);
            }
        }
        return $admins;
    }
}
