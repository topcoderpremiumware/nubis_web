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
        Schema::create('paid_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('place_id')->constrained()->onDelete('cascade');
            $table->double('amount',9,2);
            $table->string('currency');
            $table->timestamp('payment_date');
            $table->string('product_name');
            $table->integer('duration');
            $table->timestamp('expired_at')->nullable();
            $table->string('payment_intent_id');
            $table->text('receipt_url');
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
        Schema::dropIfExists('paid_bills');
    }
};
