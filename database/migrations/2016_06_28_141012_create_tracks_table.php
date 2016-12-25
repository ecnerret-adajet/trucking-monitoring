<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTracksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tracks', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->timestamp('in_plant'); // dummy time..
            $table->timestamp('out_plant');
            $table->timestamp('in_customer');
            $table->timestamp('out_customer');
            $table->timestamp('back_plant');
            $table->timestamp('entry_plant'); // this is the original plant in
            $table->timestamp('dispatch'); // consider as plant in
            $table->boolean('help')->default(0);
            $table->boolean('availability')->default(0);
            
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
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
        Schema::drop('tracks');
    }
}
