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
        Schema::table('giftcards', function (Blueprint $table) {
            $table->string('company_name')->nullable();
            $table->string('company_address')->nullable();
            $table->string('post_code')->nullable();
            $table->string('company_city')->nullable();
            $table->string('vat_number')->nullable();
            $table->string('email');
            $table->string('receiver_name');
            $table->string('receiver_email');
            $table->foreignId('country_id')->nullable();
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
            $table->dropColumn(['company_name','company_address','post_code','company_city','company_address','vat_number','email','receiver_name','receiver_email','country_id']);
        });
    }
};
