<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\CemeteryType;

class Cemiterio extends Model
{
    use HasFactory, SoftDeletes;
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
