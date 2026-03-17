import { useState } from 'react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/contexts/LogContext';
import { Lock, User, AlertCircle, Building2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addLog } = useLogs();
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/test');
      const text = await response.text();
      console.log(text);

      addLog('API_CALL', 'SYSTEM', {
        details: 'Fetch ao carregar página',
        success: true
      });

    } catch (error) {
      console.error('Erro ao buscar dados:', error);

      addLog('API_CALL', 'SYSTEM', {
        details: 'Erro no fetch ao carregar página',
        success: false
      });
    }
  };

  fetchData();
}, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const success = login(email, password);
    if (success) {
      addLog('LOGIN', 'AUTHENTICATION', {
        details: `Login bem-sucedido para ${email}`,
        success: true
      });
    } else {
      setError('Email ou senha incorretos');
      addLog('LOGIN', 'AUTHENTICATION', {
        details: `Tentativa de login falhou para ${email}`,
        success: false,
        errorMessage: 'Credenciais inválidas'
      });
    }
  };

  const quickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    const success = login(userEmail, userPassword);
    if (success) {
      addLog('LOGIN', 'AUTHENTICATION', {
        details: `Login rápido bem-sucedido para ${userEmail}`,
        success: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sistema de Cemitérios
          </h1>
          <p className="text-gray-600 mt-2">
            Gerenciamento de Sepultamentos e Aforamentos
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Entrar no Sistema</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login Demo */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Acesso Rápido - Demo</CardTitle>
            <CardDescription className="text-xs">
              Clique para fazer login com usuários de teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => quickLogin('admin@cemiterios.com', 'admin123')}
            >
              <div className="flex items-center justify-between w-full">
                <span>👑 Administrador</span>
                <span className="text-xs text-gray-500">Acesso Total</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => quickLogin('moderador@cemiterios.com', 'mod123')}
            >
              <div className="flex items-center justify-between w-full">
                <span>⚙️ Moderador</span>
                <span className="text-xs text-gray-500">Gerenciar Registros</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => quickLogin('suporte@cemiterios.com', 'suporte123')}
            >
              <div className="flex items-center justify-between w-full">
                <span>👤 Suporte</span>
                <span className="text-xs text-gray-500">Visualizar Apenas</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 space-y-2">
              <p className="font-semibold">Níveis de Acesso:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Admin:</strong> Acesso total, gerenciar cemitérios e usuários</li>
                <li><strong>Moderador:</strong> Adicionar/editar sepultamentos e aforamentos</li>
                <li><strong>Suporte:</strong> Visualizar registros e imprimir certificados</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
