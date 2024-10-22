<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $name
 * @property string $timezone
 * @property string $code
 *
 */
class Country extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function places()
    {
        return $this->hasMany(Place::class);
    }

    public function timeNow()
    {
        return Carbon::parse(Carbon::now($this->timezone)->format('Y-m-d H:i:s'));
    }
}
