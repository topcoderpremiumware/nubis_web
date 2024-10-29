<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

/**
 * @property integer $id
 * @property integer $user_id
 * @property string $action
 * @property string $comment
 * @property string $ip
 * @property Carbon $created_at
 *
 * @property User $user
 */
class Log extends Model
{
    use HasFactory, Prunable;

    protected $guarded = [];

    public function prunable()
    {
        return static::where('created_at', '<=', now()->subMonths(15));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
