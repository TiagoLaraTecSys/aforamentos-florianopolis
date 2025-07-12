<?php

namespace App\Http\Controllers;

use App\Models\Sepultamento;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class SepultamentoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): View
    {
        $query = Sepultamento::query();

        // Filtros de busca
        if ($request->filled('nome_falecido')) {
            $query->where('nome_falecido', 'like', '%' . $request->nome_falecido . '%');
        }

        if ($request->filled('cemiterio')) {
            $query->where('cemiterio', 'like', '%' . $request->cemiterio . '%');
        }

        if ($request->filled('nome_servidor')) {
            $query->where('nome_servidor', 'like', '%' . $request->nome_servidor . '%');
        }

        if ($request->filled('quadra')) {
            $query->where('quadra', 'like', '%' . $request->quadra . '%');
        }

        if ($request->filled('sepultura')) {
            $query->where('sepultura', 'like', '%' . $request->sepultura . '%');
        }

        if ($request->filled('data_inicio')) {
            $query->where('data_sepultamento', '>=', $request->data_inicio);
        }

        if ($request->filled('data_fim')) {
            $query->where('data_sepultamento', '<=', $request->data_fim);
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'data_sepultamento');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginação
        $sepultamentos = $query->paginate(20);

        return view('sepultamentos.index', compact('sepultamentos'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('sepultamentos.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nome_falecido' => 'required|string|max:255',
            'data_sepultamento' => 'nullable|date',
            'quadra' => 'nullable|string|max:100',
            'sepultura' => 'nullable|string|max:100',
            'galsc' => 'nullable|string|max:100',
            'cemiterio' => 'nullable|string|max:255',
            'nome_servidor' => 'nullable|string|max:255',
            'data_exumacao' => 'nullable|date',
            'responsavel_ou_familiar' => 'nullable|string|max:255',
            'contato' => 'nullable|string|max:255',
        ]);

        Sepultamento::create($validated);

        return redirect()->route('sepultamentos.index')
            ->with('success', 'Sepultamento criado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sepultamento $sepultamento): View
    {
        return view('sepultamentos.show', compact('sepultamento'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sepultamento $sepultamento): View
    {
        return view('sepultamentos.edit', compact('sepultamento'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sepultamento $sepultamento): RedirectResponse
    {
        $validated = $request->validate([
            'nome_falecido' => 'required|string|max:255',
            'data_sepultamento' => 'nullable|date',
            'quadra' => 'nullable|string|max:100',
            'sepultura' => 'nullable|string|max:100',
            'galsc' => 'nullable|string|max:100',
            'cemiterio' => 'nullable|string|max:255',
            'nome_servidor' => 'nullable|string|max:255',
            'data_exumacao' => 'nullable|date',
            'responsavel_ou_familiar' => 'nullable|string|max:255',
            'contato' => 'nullable|string|max:255',
        ]);

        $sepultamento->update($validated);

        return redirect()->route('sepultamentos.index')
            ->with('success', 'Sepultamento atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sepultamento $sepultamento): RedirectResponse
    {
        $sepultamento->delete();

        return redirect()->route('sepultamentos.index')
            ->with('success', 'Sepultamento excluído com sucesso!');
    }

    /**
     * Exportar dados para CSV
     */
    public function export(Request $request)
    {
        $query = Sepultamento::query();

        // Aplicar filtros se existirem
        if ($request->filled('nome_falecido')) {
            $query->where('nome_falecido', 'like', '%' . $request->nome_falecido . '%');
        }

        if ($request->filled('cemiterio')) {
            $query->where('cemiterio', 'like', '%' . $request->cemiterio . '%');
        }

        $sepultamentos = $query->get();

        $filename = 'sepultamentos_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($sepultamentos) {
            $file = fopen('php://output', 'w');
            
            // Cabeçalho do CSV
            fputcsv($file, [
                'ID',
                'Nome do Falecido',
                'Data do Sepultamento',
                'Quadra',
                'Sepultura',
                'GALSC',
                'Cemitério',
                'Nome do Servidor',
                'Data da Exumação',
                'Responsável ou Familiar',
                'Contato'
            ]);

            // Dados
            foreach ($sepultamentos as $sepultamento) {
                fputcsv($file, [
                    $sepultamento->id,
                    $sepultamento->nome_falecido,
                    $sepultamento->data_sepultamento,
                    $sepultamento->quadra,
                    $sepultamento->sepultura,
                    $sepultamento->galsc,
                    $sepultamento->cemiterio,
                    $sepultamento->nome_servidor,
                    $sepultamento->data_exumacao,
                    $sepultamento->responsavel_ou_familiar,
                    $sepultamento->contato,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
