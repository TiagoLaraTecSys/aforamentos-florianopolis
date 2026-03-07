# 📧 Configuração de Email - Laravel

## 🔧 Configurações no arquivo .env

### **Opção 1: Gmail (Recomendado para testes)**

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-de-app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=seu-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

**⚠️ Importante para Gmail:**
- Use "Senha de App" (não sua senha normal)
- Ative autenticação de 2 fatores
- Gere uma senha de app em: Google Account > Security > App passwords

### **Opção 2: HostGator (Seu provedor de hospedagem)**

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.seudominio.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@seudominio.com
MAIL_PASSWORD=sua-senha
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=seu-email@seudominio.com
MAIL_FROM_NAME="${APP_NAME}"
```

### **Opção 3: Outlook/Hotmail**

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@outlook.com
MAIL_PASSWORD=sua-senha
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=seu-email@outlook.com
MAIL_FROM_NAME="${APP_NAME}"
```

### **Opção 4: Yahoo**

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@yahoo.com
MAIL_PASSWORD=sua-senha-de-app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=seu-email@yahoo.com
MAIL_FROM_NAME="${APP_NAME}"
```

## 🧪 Testando a Configuração

### **1. Teste via Artisan**

```bash
php artisan tinker
```

```php
Mail::raw('Teste de email', function($message) {
    $message->to('seu-email@exemplo.com')
            ->subject('Teste Laravel');
});
```

### **2. Teste via Controller**

Crie um controller de teste:

```bash
php artisan make:controller TestEmailController
```

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TestEmailController extends Controller
{
    public function test()
    {
        try {
            Mail::raw('Teste de email do Laravel', function($message) {
                $message->to('seu-email@exemplo.com')
                        ->subject('Teste de Configuração');
            });
            
            return 'Email enviado com sucesso!';
        } catch (\Exception $e) {
            return 'Erro ao enviar email: ' . $e->getMessage();
        }
    }
}
```

## 🔍 Solução de Problemas

### **Erro: "Connection could not be established"**

1. **Verifique as credenciais** no .env
2. **Teste a porta** (587 ou 465)
3. **Verifique firewall** do servidor
4. **Use SSL/TLS** correto

### **Erro: "Authentication failed"**

1. **Gmail**: Use senha de app
2. **Outlook**: Ative "Less secure apps"
3. **HostGator**: Verifique credenciais no cPanel

### **Erro: "SMTP connect() failed"**

1. **Verifique MAIL_HOST**
2. **Teste MAIL_PORT**
3. **Verifique MAIL_ENCRYPTION**

## 📋 Configurações Específicas por Provedor

### **Gmail**
- **Host**: smtp.gmail.com
- **Porta**: 587 (TLS) ou 465 (SSL)
- **Autenticação**: OAuth2 ou Senha de App
- **Encryption**: TLS ou SSL

### **HostGator**
- **Host**: mail.seudominio.com
- **Porta**: 587 ou 465
- **Autenticação**: Usuário/senha do cPanel
- **Encryption**: TLS

### **Outlook**
- **Host**: smtp-mail.outlook.com
- **Porta**: 587
- **Autenticação**: Usuário/senha
- **Encryption**: TLS

## 🚀 Configuração para Produção

### **1. Limpar caches após configurar**

```bash
php artisan config:clear
php artisan cache:clear
```

### **2. Testar em produção**

```bash
php artisan tinker --execute="Mail::raw('Teste produção', function(\$m) { \$m->to('teste@exemplo.com')->subject('Teste'); });"
```

### **3. Configurar filas (opcional)**

```env
QUEUE_CONNECTION=database
```

```bash
php artisan queue:table
php artisan migrate
php artisan queue:work
```

## 📞 Suporte por Provedor

### **Gmail**
- [Google Account Security](https://myaccount.google.com/security)
- [App Passwords](https://myaccount.google.com/apppasswords)

### **HostGator**
- Chat 24/7 no cPanel
- Telefone: (11) 4003-7777

### **Outlook**
- [Microsoft Account](https://account.microsoft.com/security)
- [App Passwords](https://account.live.com/proofs/AppPassword)

## ✅ Checklist de Configuração

- [ ] Configurar .env com credenciais corretas
- [ ] Testar conexão SMTP
- [ ] Verificar autenticação
- [ ] Testar envio de email
- [ ] Configurar MAIL_FROM_ADDRESS
- [ ] Limpar caches
- [ ] Testar em produção

---

**🎉 Email configurado e funcionando!** 