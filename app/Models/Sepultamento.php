<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sepultamento extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nome_falecido',
        'data_sepultamento',
        'quadra',
        'sepultura',
        'cemiterio',
        'nome_servidor',
        'data_exumacao',
        'galsc',
        'responsavel_ou_familiar',
        'contato',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // 'data_sepultamento' => 'date',
        // 'data_exumacao' => 'date',
    ];
}
