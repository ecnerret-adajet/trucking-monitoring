<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTruckConditionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('conditions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('condition_truck', function(Blueprint $table){
            $table->integer('condition_id')->unsigned()->index();
            $table->foreign('condition_id')->references('id')->on('conditions')->onDelete('cascade');

            $table->integer('truck_id')->unsigned()->index();
            $table->foreign('truck_id')->references('id')->on('trucks')->onDelete('cascade');

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
        Schema::drop('condition_truck');
        Schema::drop('conditions');
    }
}
