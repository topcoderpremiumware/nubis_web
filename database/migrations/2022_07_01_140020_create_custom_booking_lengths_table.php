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
        Schema::create('custom_booking_lengths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('place_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->unsignedSmallInteger('length');
            $table->boolean('active');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedSmallInteger('max');
            $table->unsignedSmallInteger('min');
            $table->unsignedSmallInteger('priority');
            $table->text('labels');
            $table->string('month_days');
            $table->string('week_days');
            $table->text('spec_dates');
            $table->text('time_intervals');
            $table->string('image')->nullable();
            $table->unsignedSmallInteger('preparation_length')->default(0);
            $table->unsignedSmallInteger('min_time_before');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('custom_booking_lengths');
    }
};
