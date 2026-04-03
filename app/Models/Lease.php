<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lease extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'cemetery_id',
        'leaseholder_name',
        'quadra',
        'plot_number',
        'sector',
        'lease_type',
        'start_date',
        'expiry_date',
        'status',
        'amount',
        'responsible_name',
        'responsible_phone',
        'notes',
        'regularization_period_years',
        'next_regularization_date',
        'last_regularization_date',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'expiry_date' => 'date:Y-m-d',
        'next_regularization_date' => 'date:Y-m-d',
        'last_regularization_date' => 'date:Y-m-d',
        'regularization_period_years' => 'integer',
        'amount' => 'decimal:2',
    ];

    public function cemetery(): BelongsTo
    {
        return $this->belongsTo(Cemiterio::class, 'cemetery_id');
    }
}
