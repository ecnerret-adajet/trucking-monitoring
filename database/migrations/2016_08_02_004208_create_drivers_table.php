<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDriversTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('driver_license');
            $table->string('phone');
            $table->string('phone_backup');
            $table->string('address');
            $table->string('avatar')->default('avatar.png');
            $table->timestamps();
        });

        Schema::create('driver_truck', function (Blueprint $table){
            $table->integer('driver_id')->unsigned()->index();
            $table->foreign('driver_id')->references('id')->on('drivers')->onDelete('cascade');

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
        Schema::drop('driver_truck');
        Schema::drop('drivers');
    }
}
