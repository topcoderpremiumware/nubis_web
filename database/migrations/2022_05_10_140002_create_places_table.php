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
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address');
            $table->string('city');
            $table->string('zip_code');
            $table->string('phone');
            $table->string('email');
            $table->string('home_page');
            $table->foreignId('country_id')->constrained()->onDelete('cascade');
            $table->string('tax_number')->nullable();
            $table->foreignId('organization_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('language')->default('en');
            $table->softDeletes();
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
        Schema::dropIfExists('places');
    }
};
