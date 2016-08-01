<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTruckStatusesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('statuses', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('status_track', function(Blueprint $table) {
            $table->integer('status_id')->unsigned()->index();
            $table->foreign('status_id')->references('id')->on('statuses')->onDelete('cascade');

            $table->integer('track_id')->unsigned()->index();
            $table->foreign('track_id')->references('id')->on('tracks')->onDelete('cascade');

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
        Schema::drop('status_track');
        Schema::drop('statuses');
    }
}
