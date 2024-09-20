<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('checks', function (Blueprint $table) {
            $table->float('cash_amount')->nullable();
            $table->float('card_amount')->nullable();
        });

        DB::statement("UPDATE checks SET card_amount = CASE WHEN payment_method = 'card' THEN total ELSE card_amount END, cash_amount = CASE WHEN payment_method = 'cash' THEN total ELSE cash_amount END WHERE payment_method IS NOT NULL;");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('checks', function (Blueprint $table) {
            $table->dropColumn(['cash_amount','card_amount']);
        });
    }
};
