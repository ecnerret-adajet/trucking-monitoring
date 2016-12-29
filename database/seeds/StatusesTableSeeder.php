<?php

use Illuminate\Database\Seeder;

class StatusesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('statuses')->insert([
        	array('name' => 'NO DRIVER'),
        	array('name' => 'WAITING'),
        	array('name' => 'DOWN'),
        	array('name' => 'REPAIR'),
        	array('name' => 'CR010K'),
        	array('name' => 'DR01OK')
        ]);
    }
}
