<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCemiterioRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'location' => 'required|string',
            'address' => 'required|string',
            'totalPlots' => 'required|integer',
            'occupiedPlots' => 'required|integer',
            'totalQuadras' => 'required|integer',
            'plotsPerQuadra' => 'required|integer',
            'cemeteryType' => 'required|string',
            'yearEstablished' => 'nullable|integer',
            'areaSize' => 'required|integer',
            'hasOssuary' => 'required|boolean',
            'hasColumbarium' => 'required|boolean',
            'responsibleName' => 'nullable|string',
            'responsiblePhone' => 'nullable|string',
            'email' => 'nullable|email',
            'openingHours' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome do cemitério',
            'location' => 'localização',
            'address' => 'endereço',
            'totalPlots' => 'total de jazigos',
            'occupiedPlots' => 'jazigos ocupados',
            'totalQuadras' => 'total de quadras',
            'plotsPerQuadra' => 'jazigos por quadra',
            'cemeteryType' => 'tipo de cemitério',
            'yearEstablished' => 'ano de fundação',
            'areaSize' => 'área',
            'hasOssuary' => 'ossário',
            'hasColumbarium' => 'columbário',
            'responsibleName' => 'nome do responsável',
            'responsiblePhone' => 'telefone do responsável',
            'email' => 'email',
            'openingHours' => 'horário de funcionamento',
            'notes' => 'observações',
        ];
    }
}
