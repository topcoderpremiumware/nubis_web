<?php

namespace App\Console;

use App\Jobs\ForceOrderCompleted;
use App\Jobs\ReminderNotification;
use App\Jobs\ReserveAmountPayment;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
        $schedule->command('model:prune')->daily();
        $schedule->job(new ReminderNotification)->everyTenMinutes();
        $schedule->job(new ReserveAmountPayment)->everyTenMinutes();
        $schedule->job(new ForceOrderCompleted)->hourly();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
