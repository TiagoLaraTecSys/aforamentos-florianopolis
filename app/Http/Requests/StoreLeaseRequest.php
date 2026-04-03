<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cemetery_id'                 => 'nullable|exists:cemiterios,id',
            'leaseholder_name'            => 'required|string|max:255',
            'quadra'                      => 'nullable|string|max:50',
            'plot_number'                 => 'nullable|string|max:50',
            'sector'                      => 'nullable|string|max:100',
            'lease_type'                  => 'required|in:Perpétuo,Temporário',
            'start_date'                  => 'required|date',
            'expiry_date'                 => 'nullable|date|after:start_date',
            'status'                      => 'nullable|in:Ativo,Vencido,Renovado',
            'amount'                      => 'nullable|numeric|min:0',
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
            'leaseholder_name'            => 'nome do titular',
            'quadra'                      => 'quadra',
            'plot_number'                 => 'número do jazigo',
            'sector'                      => 'setor',
            'lease_type'                  => 'tipo de aforamento',
            'start_date'                  => 'data de início',
            'expiry_date'                 => 'data de vencimento',
            'status'                      => 'status',
            'amount'                      => 'valor',
            'responsible_name'            => 'nome do responsável',
            'responsible_phone'           => 'telefone do responsável',
            'notes'                       => 'observações',
            'regularization_period_years' => 'período de regularização (anos)',
            'next_regularization_date'    => 'próxima regularização',
            'last_regularization_date'    => 'última regularização',
        ];
    }
}
