<?php

namespace Database\Factories;

use App\Models\Lease;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeaseFactory extends Factory
{
    protected $model = Lease::class;

    public function definition(): array
    {
        return [
            'leaseholder_name'            => fake()->name(),
            'start_date'                  => now()->subYears(2)->toDateString(),
            'lease_type'                  => 'Perpétuo',
            'status'                      => 'Ativo',
            'amount'                      => fake()->randomFloat(2, 500, 10000),
            'quadra'                      => fake()->randomLetter(),
            'plot_number'                 => fake()->numerify('A-###'),
            'sector'                      => 'Setor A',
            'responsible_name'            => fake()->name(),
            'responsible_phone'           => fake()->numerify('(##) #####-####'),
            'regularization_period_years' => 5,
            'next_regularization_date'    => null,
            'last_regularization_date'    => null,
        ];
    }

    public function temporario(?string $expiryDate = null): static
    {
        return $this->state([
            'lease_type'  => 'Temporário',
            'expiry_date' => $expiryDate ?? now()->addMonths(2)->toDateString(),
        ]);
    }
}
