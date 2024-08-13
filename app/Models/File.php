<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    protected $appends = [
        'url'
    ];

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->filename);
    }
}
