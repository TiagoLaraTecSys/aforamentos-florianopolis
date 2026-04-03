<?php

namespace Database\Factories;

use App\Models\Burial;
use Illuminate\Database\Eloquent\Factories\Factory;

class BurialFactory extends Factory
{
    protected $model = Burial::class;

    public function definition(): array
    {
        return [
            'deceased_name'               => fake()->name(),
            'burial_date'                 => now()->subYears(2)->toDateString(),
            'burial_type'                 => 'INUMAÇÃO',
            'current_status'              => 'Sepultado',
            'quadra'                      => fake()->randomLetter(),
            'plot_number'                 => (string) fake()->numberBetween(1, 999),
            'sector'                      => 'Setor A',
            'responsible_name'            => fake()->name(),
            'responsible_phone'           => fake()->numerify('(##) #####-####'),
            'regularization_period_years' => 5,
            'next_regularization_date'    => null,
            'last_regularization_date'    => null,
        ];
    }

    public function withNextRegularizationIn(int $days): static
    {
        return $this->state(['next_regularization_date' => now()->addDays($days)->toDateString()]);
    }

    public function overdue(int $daysAgo = 10): static
    {
        return $this->state(['next_regularization_date' => now()->subDays($daysAgo)->toDateString()]);
    }
}
