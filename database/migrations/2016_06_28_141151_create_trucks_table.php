<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTrucksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
     public function up()
    {
        Schema::create('trucks', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned();

            $table->string('operator');
            $table->string('origin');
            $table->string('plate_no');
            $table->string('vehicle_type');
            $table->string('capacity');
            $table->boolean('availability')->default(0);

            $table->foreign('user_id')->references('id')->on('users')
                ->onDelete('cascade');

            $table->timestamps();
        });
        
        
        Schema::create('track_truck', function (Blueprint $table){
            
        $table->integer('track_id')->unsigned()->index();
        $table->foreign('track_id')->references('id')->on('tracks')->onDelete('cascade');
            
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
        Schema::drop('track_truck');
        Schema::drop('trucks');
    }
}
