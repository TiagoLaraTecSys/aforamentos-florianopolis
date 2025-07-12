# 🚀 Instruções de Deploy - Laravel no HostGator

## 📋 Pré-requisitos

### 1. **HostGator Configurado**
- Conta de hospedagem ativa
- Acesso ao cPanel
- Banco de dados MySQL criado
- Domínio configurado

### 2. **Arquivos Preparados**
- ✅ Composer otimizado (`composer install --optimize-autoloader --no-dev`)
- ✅ Assets compilados (`npm run build`)
- ✅ Aplicação pronta para produção

## 🔧 Passos para Deploy

### **Passo 1: Configurar Banco de Dados**

1. **Acesse o cPanel** do HostGator
2. **Crie um banco de dados MySQL**:
   - Vá em "MySQL Databases"
   - Crie um novo banco de dados
   - Anote: nome do banco, usuário e senha

### **Passo 2: Upload dos Arquivos**

1. **Acesse o File Manager** no cPanel
2. **Navegue até a pasta `public_html`** (ou pasta do seu domínio)
3. **Faça upload de TODOS os arquivos** do projeto Laravel
4. **IMPORTANTE**: Mantenha a estrutura de pastas

### **Passo 3: Configurar Permissões**

Execute no terminal SSH ou via File Manager:

```bash
# Permissões para pastas
chmod 755 storage/
chmod 755 bootstrap/cache/
chmod 755 public/

# Permissões para arquivos
chmod 644 .env
chmod 644 storage/logs/laravel.log
```

### **Passo 4: Configurar .env**

1. **Renomeie** `.env.example` para `.env`
2. **Edite o arquivo** `.env` com suas configurações:

```env
APP_NAME="Aforamentos"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://seudominio.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=seu_banco_de_dados
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### **Passo 5: Configurar Aplicação**

Execute via SSH ou cPanel Terminal:

```bash
# Gerar chave da aplicação
php artisan key:generate

# Limpar caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Executar migrations
php artisan migrate

# Otimizar para produção
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **Passo 6: Configurar .htaccess**

Crie/edite o arquivo `.htaccess` na raiz do projeto:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

### **Passo 7: Configurar public/.htaccess**

Verifique se o arquivo `public/.htaccess` existe e contém:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

## 🔍 Verificações Pós-Deploy

### **1. Teste de Acesso**
- ✅ Acesse o domínio
- ✅ Verifique se a página carrega
- ✅ Teste o login/registro

### **2. Verificar Logs**
- Acesse `storage/logs/laravel.log`
- Verifique se há erros

### **3. Testar Funcionalidades**
- ✅ Login/Logout
- ✅ CRUD de Sepultamentos
- ✅ Filtros
- ✅ Exportação CSV

## 🛠️ Solução de Problemas

### **Erro 500**
1. Verifique permissões das pastas
2. Verifique arquivo `.env`
3. Verifique logs em `storage/logs/`

### **Erro de Banco de Dados**
1. Verifique credenciais no `.env`
2. Verifique se o banco existe
3. Execute `php artisan migrate`

### **Assets não carregam**
1. Verifique se `npm run build` foi executado
2. Verifique permissões da pasta `public/build/`

### **Página em branco**
1. Ative `APP_DEBUG=true` temporariamente
2. Verifique logs de erro
3. Verifique sintaxe PHP

## 📞 Suporte HostGator

- **Chat Online**: Disponível 24/7
- **Telefone**: (11) 4003-7777
- **Email**: suporte@hostgator.com.br

## 🔒 Segurança

### **Recomendações:**
- ✅ Mantenha `APP_DEBUG=false` em produção
- ✅ Use senhas fortes no banco de dados
- ✅ Mantenha o Laravel atualizado
- ✅ Configure HTTPS
- ✅ Faça backups regulares

### **Backup:**
```bash
# Backup do banco
mysqldump -u usuario -p banco_de_dados > backup.sql

# Backup dos arquivos
tar -czf backup_arquivos.tar.gz /caminho/do/projeto
```

## ✅ Checklist Final

- [ ] Banco de dados criado
- [ ] Arquivos enviados
- [ ] Permissões configuradas
- [ ] .env configurado
- [ ] Chave da aplicação gerada
- [ ] Migrations executadas
- [ ] Caches limpos
- [ ] .htaccess configurado
- [ ] Funcionalidades testadas
- [ ] HTTPS configurado (recomendado)

---

**🎉 Sua aplicação Laravel está pronta para produção no HostGator!** 