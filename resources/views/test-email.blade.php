<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Teste de Email') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    
                    @if(session('success'))
                        <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {{ session('success') }}
                        </div>
                    @endif

                    @if(session('error'))
                        <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {{ session('error') }}
                        </div>
                    @endif

                    <div class="mb-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Teste Rápido</h3>
                        <button onclick="testEmail()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Testar Email (JSON)
                        </button>
                        <div id="result" class="mt-2"></div>
                    </div>

                    <div class="border-t pt-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Teste com Formulário</h3>
                        <form method="POST" action="{{ route('test.email.send') }}" class="space-y-4">
                            @csrf
                            
                            <div>
                                <x-input-label for="email" :value="__('Email de Destino')" />
                                <x-text-input id="email" name="email" type="email" class="mt-1 block w-full" 
                                             :value="old('email')" required />
                                <x-input-error :messages="$errors->get('email')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="message" :value="__('Mensagem')" />
                                <textarea id="message" name="message" rows="4" 
                                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                          required>{{ old('message', 'Teste de email do sistema Aforamentos') }}</textarea>
                                <x-input-error :messages="$errors->get('message')" class="mt-2" />
                            </div>

                            <div>
                                <x-primary-button>
                                    {{ __('Enviar Email de Teste') }}
                                </x-primary-button>
                            </div>
                        </form>
                    </div>

                    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h4 class="font-medium text-gray-900 mb-2">Configuração Atual:</h4>
                        <div class="text-sm text-gray-600 space-y-1">
                            <div><strong>MAIL_MAILER:</strong> {{ config('mail.default') }}</div>
                            <div><strong>MAIL_HOST:</strong> {{ config('mail.mailers.smtp.host') }}</div>
                            <div><strong>MAIL_PORT:</strong> {{ config('mail.mailers.smtp.port') }}</div>
                            <div><strong>MAIL_ENCRYPTION:</strong> {{ config('mail.mailers.smtp.encryption') }}</div>
                            <div><strong>MAIL_FROM_ADDRESS:</strong> {{ config('mail.from.address') }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function testEmail() {
            fetch('{{ route("test.email") }}')
                .then(response => response.json())
                .then(data => {
                    const resultDiv = document.getElementById('result');
                    if (data.success) {
                        resultDiv.innerHTML = '<div class="text-green-600">✅ ' + data.message + '</div>';
                    } else {
                        resultDiv.innerHTML = '<div class="text-red-600">❌ ' + data.message + '</div>';
                    }
                })
                .catch(error => {
                    document.getElementById('result').innerHTML = '<div class="text-red-600">❌ Erro na requisição: ' + error.message + '</div>';
                });
        }
    </script>
</x-app-layout> 