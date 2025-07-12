<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                {{ __('Detalhes do Sepultamento') }}
            </h2>
            <div class="flex space-x-2">
                <a href="{{ route('sepultamentos.edit', $sepultamento) }}" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                    Editar
                </a>
                <a href="{{ route('sepultamentos.index') }}" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Voltar
                </a>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Informações Principais -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                Informações do Falecido
                            </h3>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Nome do Falecido</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->nome_falecido }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Data do Sepultamento</label>
                                <p class="mt-1 text-sm text-gray-900">
                                    {{ $sepultamento->data_sepultamento ? \Carbon\Carbon::parse($sepultamento->data_sepultamento)->format('d/m/Y') : 'Não informado' }}
                                </p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Data da Exumação</label>
                                <p class="mt-1 text-sm text-gray-900">
                                    {{ $sepultamento->data_exumacao ? \Carbon\Carbon::parse($sepultamento->data_exumacao)->format('d/m/Y') : 'Não informado' }}
                                </p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Responsável ou Familiar</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->responsavel_ou_familiar ?: 'Não informado' }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Contato</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->contato ?: 'Não informado' }}</p>
                            </div>
                        </div>

                        <!-- Informações do Local -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                Localização
                            </h3>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Cemitério</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->cemiterio ?: 'Não informado' }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Quadra</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->quadra ?: 'Não informado' }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Sepultura</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->sepultura ?: 'Não informado' }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">GALSC</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->galsc ?: 'Não informado' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Informações do Servidor -->
                    <div class="mt-8 space-y-4">
                        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                            Informações do Servidor
                        </h3>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Nome do Servidor</label>
                            <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->nome_servidor ?: 'Não informado' }}</p>
                        </div>
                    </div>

                    <!-- Informações do Sistema -->
                    <div class="mt-8 space-y-4">
                        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                            Informações do Sistema
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">ID do Registro</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->id }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Criado em</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->created_at ? \Carbon\Carbon::parse($sepultamento->created_at)->format('d/m/Y H:i:s') : 'Não informado' }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Atualizado em</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $sepultamento->updated_at ? \Carbon\Carbon::parse($sepultamento->updated_at)->format('d/m/Y H:i:s') : 'Não informado' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Ações -->
                    <div class="mt-8 flex space-x-4">
                        <a href="{{ route('sepultamentos.edit', $sepultamento) }}" 
                           class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                            Editar Sepultamento
                        </a>
                        
                        <form action="{{ route('sepultamentos.destroy', $sepultamento) }}" method="POST" class="inline">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    onclick="return confirm('Tem certeza que deseja excluir este sepultamento?')">
                                Excluir Sepultamento
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 