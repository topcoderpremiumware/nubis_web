<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

/**
 * @property integer $id
 * @property string $name
 * @property string $address
 * @property string $city
 * @property string $zip_code
 * @property string $phone
 * @property string $email
 * @property string $home_page
 * @property integer $country_id
 * @property string $tax_number
 * @property integer $organization_id
 * @property string $language
 * @property Carbon $deleted_at
 *
 * @property Organization $organization
 * @property Collection<User> $users
 * @property Collection<Tableplan> $tableplans
 * @property Collection<Timetable> $timetables
 * @property Collection<Area> $areas
 * @property Collection<CustomBookingLength> $custom_booking_lengths
 * @property Collection<Order> $orders
 * @property Collection<Menu> $menus
 * @property Collection<MessageTemplate> $message_templates
 * @property Collection<Giftcard> $giftcards
 * @property Collection<Coupon> $coupons
 * @property Collection<Setting> $settings
 * @property Country $country
 * @method static Place find(mixed $place_id)
 */
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

    public function custom_booking_lengths()
    {
        return $this->hasMany(CustomBookingLength::class);
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

    public function paid_messages()
    {
        return $this->hasMany(PaidMessage::class);
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

    public function allow_send_sms(): bool
    {
        $sms_limit_count = $this->setting('sms_limit_count') ?? 0;
        return $sms_limit_count > 0;
    }

    public function increase_sms_limit($number = 1)
    {
        $sms_limit_count = $this->setting('sms_limit_count') ?? 0;
        Setting::updateOrCreate([
            'place_id' => $this->id,
            'name' => 'sms_limit_count'
        ],[
            'value' => $sms_limit_count+$number
        ]);
    }

    public function decrease_sms_limit($number = 1)
    {
        $sms_limit_count = $this->setting('sms_limit_count') ?? 0;
        if($sms_limit_count-$number >= 0){
            Setting::updateOrCreate([
                'place_id' => $this->id,
                'name' => 'sms_limit_count'
            ],[
                'value' => $sms_limit_count-$number
            ]);
        }
    }
}
