<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $place_id
 * @property string $serial
 * @property string $url
 * @property string $provider // swedbank/verifone
 * @property string $name
 *
 * @property Place $place
 * @method static Terminal find($terminal_id)
 */
class Terminal extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
