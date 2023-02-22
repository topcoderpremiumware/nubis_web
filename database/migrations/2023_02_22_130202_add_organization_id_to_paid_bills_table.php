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
        Schema::table('paid_bills', function (Blueprint $table) {
            $table->dropConstrainedForeignId('place_id');
            $table->foreignId('organization_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('paid_bills', function (Blueprint $table) {
            $table->dropConstrainedForeignId('organization_id');
            $table->foreignId('place_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });
    }
};
