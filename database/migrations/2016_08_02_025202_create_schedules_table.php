<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSchedulesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('schedule_truck', function(Blueprint $table) {
            $table->integer('truck_id')->unsigned()->index();
            $table->foreign('truck_id')->references('id')->on('trucks')->onDelete('cascade');

            $table->integer('schedule_id')->unsigned()->index();
            $table->foreign('schedule_id')->references('id')->on('schedules')->onDelete('cascade');

            $table->timestamps();

        });

        Schema::create('customer_schedule', function(Blueprint $table){
            $table->integer('customer_id')->unsigned()->index();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');

            $table->integer('schedule_id')->unsigned()->index();
            $table->foreign('schedule_id')->references('id')->on('schedules')->onDelete('cascade');

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
        Schema::drop('schedule_truck');
        Schema::drop('customer_schedule');
        Schema::drop('schedules');
    }
}
