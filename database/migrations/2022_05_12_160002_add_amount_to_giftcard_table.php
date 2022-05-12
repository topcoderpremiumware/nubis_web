<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
        Schema::table('giftcards', function (Blueprint $table) {
            $table->timestamp('expired_at');
            $table->double('initial_amount',9,2);
            $table->double('spend_amount',9,2);
        });
        Schema::table('coupons', function (Blueprint $table) {
            $table->timestamp('expired_at');
            $table->double('amount',9,2);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('giftcards', function (Blueprint $table) {
            $table->dropColumn(['expired_at','initial_amount','spend_amount']);
        });
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['expired_at','amount']);
        });
    }
};
