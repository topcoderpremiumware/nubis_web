<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private $user;
    private $token;
    private $type;

    /**
     * Create a new notification instance.
     */
    public function __construct($user,$token,$type)
    {
        $this->user = $user;
        $this->token = $token;
        $this->type = $type;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Password reset')
            ->line('You can reset your password by the link bellow')
            ->action('Reset link', env('MIX_APP_URL').'/admin/password_reset?email='.$this->user->email.'&token='.$this->token.'&type='.$this->type);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
