<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OperadorUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'operador@aforamentos.com'],
            [
                'name'     => 'Operador',
                'password' => Hash::make('operador123'),
            ]
        );

        $user->syncRoles(['operador']);
    }
}
