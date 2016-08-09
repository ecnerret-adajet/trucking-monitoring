<?php

use Illuminate\Database\Seeder;

class SchedulesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
          DB::table('schedules')->insert([
              array('name'=>'N/A' ),
              array('name'=>'Unavailable' ),
            array('name'=>'Available' )  
        ]);
    }
}
