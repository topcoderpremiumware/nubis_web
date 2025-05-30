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
            $table->foreignId('giftcard_menu_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('background_image')->nullable();
            $table->text('greetings')->nullable();
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
            $table->dropForeign(['giftcard_menu_id']);
            $table->dropColumn(['background_image','greetings','giftcard_menu_id']);
        });
    }
};
