<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'user_role',
        'entity_type',
        'entity_id',
        'action',
        'before_data',
        'after_data',
        'ip_address',
    ];

    protected $casts = [
        'before_data' => 'array',
        'after_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
