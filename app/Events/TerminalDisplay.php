<?php

namespace App\Events;

use App\Models\Terminal;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TerminalDisplay implements ShouldBroadcast
{
    use SerializesModels;

    public Terminal $terminal;
    public int $code;
    public string $message;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(int $terminal_id, int $code, string $message = '')
    {
        $this->terminal = Terminal::find($terminal_id);
        $this->message = $message;
        $this->code = $code;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn(): Channel|array
    {
        return new Channel('place-'.$this->terminal->place_id);
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'terminal-display';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'terminal' => $this->terminal,
            'code' => $this->code,
            'message' => $this->message
        ];
    }
}
