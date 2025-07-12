#!/bin/bash

echo "🚀 Iniciando deploy da aplicação Laravel..."

# Verificar se estamos no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto Laravel"
    exit 1
fi

echo "📦 Otimizando dependências..."
composer install --optimize-autoloader --no-dev

echo "🎨 Compilando assets..."
npm run build

echo "🗄️ Executando migrations..."
php artisan migrate --force

echo "🧹 Limpando caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "⚡ Otimizando para produção..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "🔐 Verificando chave da aplicação..."
if [ -z "$(grep 'APP_KEY=base64:' .env)" ]; then
    echo "🔑 Gerando chave da aplicação..."
    php artisan key:generate
fi

echo "📋 Verificando permissões..."
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chmod 644 .env

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Faça upload dos arquivos para o servidor"
echo "2. Configure o arquivo .env com as credenciais do banco"
echo "3. Execute: php artisan migrate"
echo "4. Teste a aplicação"
echo ""
echo "📖 Consulte o arquivo DEPLOY_INSTRUCTIONS.md para instruções detalhadas" 