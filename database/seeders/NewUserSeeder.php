<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\Hash;
use App\Models\User;
class NewUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
                    [
                        'name' => 'Nicolas',
                        'email' => 'nicolas.comcap@pmf.sc.gov.br',
                        'password' => Hash::make('pm7#f45g'), // Troque por uma senha segura
                        'email_verified_at' => now()
                    ]
                );
    }
}
