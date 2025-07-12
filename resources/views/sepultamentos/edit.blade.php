<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                {{ __('Editar Sepultamento') }}
            </h2>
            <a href="{{ route('sepultamentos.index') }}" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Voltar
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    
                    <form method="POST" action="{{ route('sepultamentos.update', $sepultamento) }}" class="space-y-6">
                        @csrf
                        @method('PUT')

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Nome do Falecido -->
                            <div>
                                <x-input-label for="nome_falecido" :value="__('Nome do Falecido')" />
                                <x-text-input id="nome_falecido" name="nome_falecido" type="text" class="mt-1 block w-full" 
                                             :value="old('nome_falecido', $sepultamento->nome_falecido)" required autofocus />
                                <x-input-error :messages="$errors->get('nome_falecido')" class="mt-2" />
                            </div>

                            <!-- Data do Sepultamento -->
                            <div>
                                <x-input-label for="data_sepultamento" :value="__('Data do Sepultamento')" />
                                <x-text-input id="data_sepultamento" name="data_sepultamento" type="date" class="mt-1 block w-full" 
                                             :value="old('data_sepultamento', $sepultamento->data_sepultamento ? \Carbon\Carbon::parse($sepultamento->data_sepultamento)->format('Y-m-d') : '')" />
                                <x-input-error :messages="$errors->get('data_sepultamento')" class="mt-2" />
                            </div>

                            <!-- Quadra -->
                            <div>
                                <x-input-label for="quadra" :value="__('Quadra')" />
                                <x-text-input id="quadra" name="quadra" type="text" class="mt-1 block w-full" 
                                             :value="old('quadra', $sepultamento->quadra)" />
                                <x-input-error :messages="$errors->get('quadra')" class="mt-2" />
                            </div>

                            <!-- Sepultura -->
                            <div>
                                <x-input-label for="sepultura" :value="__('Sepultura')" />
                                <x-text-input id="sepultura" name="sepultura" type="text" class="mt-1 block w-full" 
                                             :value="old('sepultura', $sepultamento->sepultura)" />
                                <x-input-error :messages="$errors->get('sepultura')" class="mt-2" />
                            </div>

                            <!-- GALSC -->
                            <div>
                                <x-input-label for="galsc" :value="__('GALSC')" />
                                <x-text-input id="galsc" name="galsc" type="text" class="mt-1 block w-full" 
                                             :value="old('galsc', $sepultamento->galsc)" />
                                <x-input-error :messages="$errors->get('galsc')" class="mt-2" />
                            </div>

                            <!-- Cemitério -->
                            <div>
                                <x-input-label for="cemiterio" :value="__('Cemitério')" />
                                <x-text-input id="cemiterio" name="cemiterio" type="text" class="mt-1 block w-full" 
                                             :value="old('cemiterio', $sepultamento->cemiterio)" />
                                <x-input-error :messages="$errors->get('cemiterio')" class="mt-2" />
                            </div>

                            <!-- Nome do Servidor -->
                            <div>
                                <x-input-label for="nome_servidor" :value="__('Nome do Servidor')" />
                                <x-text-input id="nome_servidor" name="nome_servidor" type="text" class="mt-1 block w-full" 
                                             :value="old('nome_servidor', $sepultamento->nome_servidor)" />
                                <x-input-error :messages="$errors->get('nome_servidor')" class="mt-2" />
                            </div>

                            <!-- Data da Exumação -->
                            <div>
                                <x-input-label for="data_exumacao" :value="__('Data da Exumação')" />
                                <x-text-input id="data_exumacao" name="data_exumacao" type="date" class="mt-1 block w-full" 
                                             :value="old('data_exumacao', $sepultamento->data_exumacao ? \Carbon\Carbon::parse($sepultamento->data_exumacao)->format('Y-m-d') : '')" />
                                <x-input-error :messages="$errors->get('data_exumacao')" class="mt-2" />
                            </div>

                            <!-- Responsável ou Familiar -->
                            <div>
                                <x-input-label for="responsavel_ou_familiar" :value="__('Responsável ou Familiar')" />
                                <x-text-input id="responsavel_ou_familiar" name="responsavel_ou_familiar" type="text" class="mt-1 block w-full" 
                                             :value="old('responsavel_ou_familiar', $sepultamento->responsavel_ou_familiar)" />
                                <x-input-error :messages="$errors->get('responsavel_ou_familiar')" class="mt-2" />
                            </div>

                            <!-- Contato -->
                            <div>
                                <x-input-label for="contato" :value="__('Contato')" />
                                <x-text-input id="contato" name="contato" type="text" class="mt-1 block w-full" 
                                             :value="old('contato', $sepultamento->contato)" placeholder="Telefone, email ou endereço" />
                                <x-input-error :messages="$errors->get('contato')" class="mt-2" />
                            </div>
                        </div>

                        <div class="flex items-center justify-end mt-6">
                            <x-primary-button class="ml-3">
                                {{ __('Atualizar Sepultamento') }}
                            </x-primary-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 