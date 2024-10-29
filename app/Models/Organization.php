<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
/**
 * @property integer $id
 * @property string $name
 */
class Organization extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function places()
    {
        return $this->hasMany(Place::class);
    }


}
