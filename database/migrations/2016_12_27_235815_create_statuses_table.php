<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStatusesTable extends Migration
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
            $table->string('location');
            $table->timestamp('dr_date');
            $table->string('customer');
            $table->string('customer_address');
            $table->string('commodities');
            $table->text('remarks');
            $table->timestamps();
        });

        Schema::create('status_truck', function (Blueprint $table){
            $table->integer('truck_id')->unsigned();
            $table->foreign('truck_id')->references('id')->on('trucks')
                    ->onDelete('cascade');
            $table->integer('status_id')->unsigned();
            $table->foreign('status_id')->references('id')->on('statuses')
                ->onDelete('cascade');
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
        Schema::drop('status_truck');
        Schema::drop('statuses');
    }
}
