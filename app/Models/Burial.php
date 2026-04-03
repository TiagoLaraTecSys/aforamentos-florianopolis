<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Burial extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'cemetery_id',
        'galsc',
        'burial_number',
        'deceased_name',
        'date_of_birth',
        'date_of_death',
        'burial_date',
        'quadra',
        'plot_number',
        'sector',
        'burial_type',
        'current_status',
        'responsible_name',
        'responsible_phone',
        'notes',
        'regularization_period_years',
        'next_regularization_date',
        'last_regularization_date',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'date_of_death' => 'date:Y-m-d',
        'burial_date' => 'date:Y-m-d',
        'next_regularization_date' => 'date:Y-m-d',
        'last_regularization_date' => 'date:Y-m-d',
        'regularization_period_years' => 'integer',
    ];

    public function cemetery(): BelongsTo
    {
        return $this->belongsTo(Cemiterio::class, 'cemetery_id');
    }
}
