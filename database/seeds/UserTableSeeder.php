<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\User;
use App\Permission;
use App\Role;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
          /* Users table */
        $usersData = array(
            array(
              "id" => "1",  "name" => "admin", "password" => Hash::make("password"), "email" => "admin@trucking.com"
            )
        );

         foreach ($usersData as $user)
        {
            $users[] = User::create($user);
        }
         $this->command->info('Users table seeded');

         /* Roles table */
        $roles = array(
            array("name" => "Administrator", "display_name" => "Administrator", "description" => "Overall Administrator"),
            array("name" => "User", "display_name" => "User", "description" => "Read Only"),
           
        );
        foreach ($roles as $role) {
            Role::create($role);
        }
        $this->command->info('Roles table seeded');

        $role1 = Role::find(1);
        $permissions = Permission::all();

        //Assign all permissions to role administrator
        foreach ($permissions as $permission) {
            $role1->attachPermission($permission);
        }
        //Assign role Superadmin to all permissions
        User::find(1)->attachRole($role1);
    }
}
