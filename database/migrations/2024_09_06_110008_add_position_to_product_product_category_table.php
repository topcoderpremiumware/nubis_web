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
        Schema::table('product_product_category', function (Blueprint $table) {
            $table->unsignedSmallInteger('position')->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('product_product_category', function (Blueprint $table) {
            $table->dropColumn(['position']);
        });
    }
};
