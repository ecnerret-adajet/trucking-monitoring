<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCustomersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('origin');
            $table->string('customer_name');
            $table->string('destination');
            $table->integer('time_to_customer');
            $table->integer('time_to_origin');
            $table->string('phones');
            $table->integer('total_hours');
            $table->timestamps();
            $table->softDeletes();
        });
        
        Schema::create('customer_track', function(Blueprint $table) {
            $table->integer('customer_id')->unsigned()->index();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            
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
        Schema::drop('customer_track');
        Schema::drop('customers');
    }
}
