<?php

use Illuminate\Database\Seeder;

class AssignmentTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
           DB::table('assignments')->insert([
             array('name'=>'LFUG' ),
             array('name'=>'FEEDS' ),
            array('name'=>'PFMC' ), 
            array('name'=>'PLILI' )
        ]);
    }
}
