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
        if(!Schema::hasColumn('product_categories','path')){
            Schema::table('product_categories', function (Blueprint $table) {
                $table->string('path')->nullable();
            });
        }

        $categories = \App\Models\ProductCategory::orderBy('parent_id','ASC')->get();
        if($categories->count() > 0){
            foreach ($categories as $category) {
                if($category->parent_id) $parent = $category->parent->fresh();
                $category->path = ($category->parent_id ? $parent->path : 0).'.'.$category->id;
                $category->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropColumn(['path']);
        });
    }
};
