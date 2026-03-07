<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                {{ __('Usuários') }}
            </h2>
            <div class="flex space-x-2">
                <a href="{{ route('register') }}" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Adicionar novo usuário
                </a>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">

                    <!-- Filtros -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-medium text-gray-900">Filtros</h3>
                            <button onclick="toggleFilters()"
                                    class="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                                </svg>
                                <span>Filtros</span>
                            </button>
                        </div>

                        <div id="filtersDropdown" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200" style="display: none;">

                            <form method="GET" action="{{ route('sepultamentos.index') }}" class="space-y-4">
                                <!-- Nome do Falecido -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Falecido</label>
                                    <input type="text" name="nome_falecido" value="{{ request('nome_falecido') }}"
                                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>

                                <!-- Cemitério -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Cemitério</label>
                                    <input type="text" name="cemiterio" value="{{ request('cemiterio') }}"
                                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>

                                <!-- Nome do Servidor -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Servidor</label>
                                    <input type="text" name="nome_servidor" value="{{ request('nome_servidor') }}"
                                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>

                                <!-- Quadra -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Quadra</label>
                                    <input type="text" name="quadra" value="{{ request('quadra') }}"
                                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>

                                <!-- Sepultura -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Sepultura</label>
                                    <input type="text" name="sepultura" value="{{ request('sepultura') }}"
                                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>

                                <!-- Data Início -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                                    <input type="date" name="data_inicio" value="{{ request('data_inicio') }}"
                                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>

                                <!-- Data Fim -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                                    <input type="date" name="data_fim" value="{{ request('data_fim') }}"
                                           class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>

                                <!-- Botões -->
                                <div class="flex space-x-3 pt-2">
                                    <button type="submit" class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                                        Aplicar Filtros
                                    </button>
                                    <a href="{{ route('sepultamentos.index') }}" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                        Limpar Filtros
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>

                    <script>
                        function toggleFilters() {
                            const dropdown = document.getElementById('filtersDropdown');
                            if (dropdown.style.display === 'none') {
                                dropdown.style.display = 'block';
                            } else {
                                dropdown.style.display = 'none';
                            }
                        }
                    </script>

                    <!-- Mensagens de sucesso -->
                    @if(session('success'))
                        <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {{ session('success') }}
                        </div>
                    @endif

                    <!-- Tabela -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <a href="">
                                            Nome
                                        </a>
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <a href="">
                                            E-mail
                                        </a>
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <a href="">
                                            Permissoes
                                        </a>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                @foreach ($users as $user)
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {{ $user->name }}
                                        </td>

                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {{ $user->email }}
                                        </td>

                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {{ $user->role ?? 'Usuário' }}
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    <!-- Paginação -->
                    <div class="mt-6">
                        {{ $users->links() }}
                    </div>

                    <form method="GET" class="mb-4 flex justify-between items-center">
                        <div>
                                                    <label class="text-sm text-gray-600">Itens por página:</label>

                                                    <select name="per_page"
                                                            onchange="this.form.submit()"
                                                            class="border-gray-300 rounded-md shadow-sm">

                                                        <option value="1" {{ $perPage == 1 ? 'selected' : '' }}>1</option>
                                                        <option value="10" selected {{ $perPage == 10 ? 'selected' : '' }}>10</option>
                                                        <option value="25" {{ $perPage == 25 ? 'selected' : '' }}>25</option>
                                                        <option value="50" {{ $perPage == 50 ? 'selected' : '' }}>50</option>

                                                    </select></div>
                        <div class="mt-6 text-sm text-gray-600">
                            Total de registros: {{ $users->total() }}
                        </div>

                    </form>

                </div>
            </div>
        </div>
    </div>
</x-app-layout>
