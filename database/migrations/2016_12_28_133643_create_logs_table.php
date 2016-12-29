<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('truck_id')->unsigned();
            $table->string('name');
            $table->string('location');
            $table->timestamp('dr_date');
            $table->string('customer');
            $table->string('customer_address');
            $table->string('commodities');
            $table->text('remarks');
            $table->foreign('truck_id')->references('id')->on('trucks')
                    ->onDelete('cascade');
            $table->timestamps();
        });

        // Schema::create('log_status', function (Blueprint $table){
        //     $table->integer('log_id')->unsigned();
        //     $table->foreign('log_id')->references('id')->on('logs')
        //             ->onDelete('cascade');
        //     $table->integer('status_id')->unsigned();
        //     $table->foreign('status_id')->references('id')->on('statuses')
        //         ->onDelete('cascade');
        //     $table->timestamps();
        // });


    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Schema::drop('log_status');
        Schema::drop('logs');
    }
}
