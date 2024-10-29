<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property integer $id
 * @property string $name
 * @property string $email
 * @property string $first_name
 * @property string $last_name
 * @property string $language
 * @property bool $is_superadmin
 * @property string $phone
 * @property integer $pin
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property Collection<Place> $places
 * @property Collection<Role> $roles
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'language',
        'phone',
        'pin'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class)->withPivot(["place_id"]);
    }

    public function places()
    {
        return $this->belongsToMany(Place::class);
    }

    public function hasRole($title,$place_id)
    {
        foreach ($this->roles as $role){
            if ($role->pivot->place_id == $place_id && $role->title == $title){
                return true;
            }
        }
        return false;
    }
}
