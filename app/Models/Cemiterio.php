<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\CemeteryType;

class Cemiterio extends Model
{
    protected $fillable = [
        'name',
        'location',
        'address',
        'totalPlots',
        'occupiedPlots',
        'totalQuadras',
        'plotsPerQuadra',
        'cemeteryType',
        'yearEstablished',
        'areaSize',
        'hasOssuary',
        'hasColumbarium',
        'responsibleName',
        'responsiblePhone',
        'email',
        'openingHours',
        'notes'
    ];

    protected $casts = [
            'cemeteryType' => CemeteryType::class,
            'hasOssuary' => 'boolean',
            'hasColumbarium' => 'boolean',
    ];
}
