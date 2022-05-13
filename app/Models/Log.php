<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Log extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public static function add($request,$action,$comment)
    {
        self::create([
            'user_id' => Auth::user()->id,
            'action' => $action,
            'comment' => $comment,
            'ip' => $request->ip()
        ]);
    }
}
