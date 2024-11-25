<?php

namespace App\Events;

use App\Models\Terminal;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TerminalPrintData implements ShouldBroadcast
{
    use SerializesModels;

    public Terminal $terminal;
    public string $data;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(int $terminal_id, string $data)
    {
        $this->terminal = Terminal::find($terminal_id);
        $this->data = $data;
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
        return 'terminal-print-data';
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
            'url' => env('APP_URL').'/api/checks/'.$this->data.'/print_template',
        ];
    }
}
