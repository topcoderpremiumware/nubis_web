<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Support\Facades\Auth;

class Log extends Model
{
    use HasFactory, Prunable;

    protected $guarded = [];

    public function prunable()
    {
        return static::where('created_at', '<=', now()->subMonths(3));
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public static function add($request,$action,$comment)
    {
        if(Auth::check()){
            $user_id = Auth::user()->id;
        }else{
            $user_id = Auth::guard('customer')->user()->id;
        }
        self::create([
            'user_id' => $user_id,
            'action' => $action,
            'comment' => $comment,
            'ip' => $request->ip()
        ]);
    }
}
