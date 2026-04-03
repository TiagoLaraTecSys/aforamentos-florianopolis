<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBurialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cemetery_id'                 => 'nullable|exists:cemiterios,id',
            'galsc'                       => 'nullable|string|max:100',
            'burial_number'               => 'nullable|string|max:100',
            'deceased_name'               => 'required|string|max:255',
            'date_of_birth'               => 'nullable|date',
            'date_of_death'               => 'nullable|date',
            'burial_date'                 => 'required|date',
            'quadra'                      => 'nullable|string|max:50',
            'plot_number'                 => 'nullable|string|max:50',
            'sector'                      => 'nullable|string|max:100',
            'burial_type'                 => 'required|in:INUMAÇÃO,TUMULAÇÃO(GAVETA),EXUMAÇÃO,TRANSLADAÇÃO,CREMAÇÃO,REINUMAÇÃO,OSSÁRIO',
            'current_status'              => 'required|in:Sepultado,Exumado,Transladado,Cremado',
            'responsible_name'            => 'nullable|string|max:255',
            'responsible_phone'           => 'nullable|string|max:50',
            'notes'                       => 'nullable|string',
            'regularization_period_years' => 'nullable|integer|min:1',
            'next_regularization_date'    => 'nullable|date',
            'last_regularization_date'    => 'nullable|date',
        ];
    }

    public function attributes(): array
    {
        return [
            'cemetery_id'                 => 'cemitério',
            'galsc'                       => 'GALSC',
            'burial_number'               => 'número do sepultamento',
            'deceased_name'               => 'nome do falecido',
            'date_of_birth'               => 'data de nascimento',
            'date_of_death'               => 'data de falecimento',
            'burial_date'                 => 'data do sepultamento',
            'quadra'                      => 'quadra',
            'plot_number'                 => 'número do jazigo',
            'sector'                      => 'setor',
            'burial_type'                 => 'tipo de sepultamento',
            'current_status'              => 'status atual',
            'responsible_name'            => 'nome do responsável',
            'responsible_phone'           => 'telefone do responsável',
            'notes'                       => 'observações',
            'regularization_period_years' => 'período de regularização (anos)',
            'next_regularization_date'    => 'próxima regularização',
            'last_regularization_date'    => 'última regularização',
        ];
    }
}
