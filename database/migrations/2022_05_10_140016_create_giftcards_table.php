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
        Schema::create('giftcards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('place_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code');
            $table->timestamp('expired_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->double('initial_amount',9,2);
            $table->double('spend_amount',9,2);
            $table->string('company_name')->nullable();
            $table->string('company_address')->nullable();
            $table->string('post_code')->nullable();
            $table->string('company_city')->nullable();
            $table->string('vat_number')->nullable();
            $table->string('email');
            $table->string('receiver_name');
            $table->string('receiver_email');
            $table->foreignId('country_id')->nullable();
            $table->string('status')->default('pending');
            $table->string('filename')->nullable();
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
        Schema::dropIfExists('giftcards');
    }
};
