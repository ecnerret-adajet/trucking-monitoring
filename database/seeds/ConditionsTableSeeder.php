<?php

use Illuminate\Database\Seeder;

class ConditionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
           DB::table('conditions')->insert([
             array('name'=>'Awarded' ),
             array('name'=>'Not operational' ),
            array('name'=>'Inactive' )
            ]);
    }
}
