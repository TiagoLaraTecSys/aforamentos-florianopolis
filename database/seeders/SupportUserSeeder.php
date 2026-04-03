<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SupportUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'suporte@aforamentos.com'],
            [
                'name'     => 'Suporte',
                'password' => Hash::make('suporte123'),
            ]
        );

        $user->syncRoles(['suporte']);
    }
}
