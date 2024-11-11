<?php

namespace App\Events;

use App\Models\Order;
use App\Models\Terminal;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TerminalError implements ShouldBroadcast
{
    use SerializesModels;

    public Terminal $terminal;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(int $terminal_id)
    {
        $this->terminal = Terminal::find($terminal_id);
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
        return 'terminal-error';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return ['terminal' => $this->terminal];
    }
}
