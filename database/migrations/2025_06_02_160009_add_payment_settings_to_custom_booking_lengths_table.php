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
        Schema::table('custom_booking_lengths', function (Blueprint $table) {
            $table->text('payment_settings')->nullable();
            $table->boolean('is_overwrite')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('custom_booking_lengths', function (Blueprint $table) {
            $table->dropColumn(['payment_settings','is_overwrite']);
        });
    }
};
