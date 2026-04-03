<?php

namespace Database\Factories;

use App\Models\Cemiterio;
use Illuminate\Database\Eloquent\Factories\Factory;

class CemiterioFactory extends Factory
{
    protected $model = Cemiterio::class;

    public function definition(): array
    {
        return [
            'name'            => fake()->unique()->company() . ' Cemetery',
            'location'        => fake()->city(),
            'address'         => fake()->streetAddress(),
            'totalPlots'      => 1000,
            'occupiedPlots'   => 500,
            'totalQuadras'    => 10,
            'plotsPerQuadra'  => 100,
            'cemeteryType'    => 'Municipal',
            'yearEstablished' => 1980,
            'areaSize'        => 50000,
            'hasOssuary'      => false,
            'hasColumbarium'  => false,
        ];
    }
}
