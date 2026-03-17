import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLogs, LogCategory, LogAction, ActionDescriptions, CategoryDescriptions } from '@/contexts/LogContext';

export function SystemLogs() {
  const { logs, clearLogs, getLogs } = useLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'ALL'>('ALL');
  const [filterAction, setFilterAction] = useState<LogAction | 'ALL'>('ALL');
  const [filterUser, setFilterUser] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Obter usuários únicos dos logs
  const uniqueUsers = Array.from(new Set(logs.map(log => log.userName)));

  // Aplicar filtros
  const filteredLogs = logs.filter(log => {
    // Filtro de categoria
    if (filterCategory !== 'ALL' && log.category !== filterCategory) {
      return false;
    }

    // Filtro de ação
    if (filterAction !== 'ALL' && log.action !== filterAction) {
      return false;
    }

    // Filtro de usuário
    if (filterUser !== 'ALL' && log.userName !== filterUser) {
      return false;
    }

    // Filtro de data inicial
    if (startDate && log.timestamp < new Date(startDate)) {
      return false;
    }

    // Filtro de data final
    if (endDate && log.timestamp > new Date(endDate + 'T23:59:59')) {
      return false;
    }

    // Filtro de busca por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.userName.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.target?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower) ||
        log.cemeteryName?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Estatísticas
  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const today = new Date();
      return log.timestamp.toDateString() === today.toDateString();
    }).length,
    success: logs.filter(log => log.success).length,
    failed: logs.filter(log => !log.success).length,
    byCategory: {
      AUTHENTICATION: logs.filter(log => log.category === 'AUTHENTICATION').length,
      BURIAL: logs.filter(log => log.category === 'BURIAL').length,
      LEASE: logs.filter(log => log.category === 'LEASE').length,
      CEMETERY: logs.filter(log => log.category === 'CEMETERY').length,
      SYSTEM: logs.filter(log => log.category === 'SYSTEM').length,
      NOTIFICATION: logs.filter(log => log.category === 'NOTIFICATION').length,
    }
  };

  const getCategoryColor = (category: LogCategory) => {
    const colors: Record<LogCategory, string> = {
      AUTHENTICATION: 'bg-blue-100 text-blue-800',
      BURIAL: 'bg-purple-100 text-purple-800',
      LEASE: 'bg-green-100 text-green-800',
      CEMETERY: 'bg-orange-100 text-orange-800',
      SYSTEM: 'bg-gray-100 text-gray-800',
      NOTIFICATION: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category];
  };

  const getCategoryIcon = (category: LogCategory) => {
    const icons: Record<LogCategory, JSX.Element> = {
      AUTHENTICATION: <User className="w-4 h-4" />,
      BURIAL: <FileText className="w-4 h-4" />,
      LEASE: <FileText className="w-4 h-4" />,
      CEMETERY: <Activity className="w-4 h-4" />,
      SYSTEM: <Activity className="w-4 h-4" />,
      NOTIFICATION: <AlertTriangle className="w-4 h-4" />
    };
    return icons[category];
  };

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'Data/Hora', 'Usuário', 'Função', 'Ação', 'Categoria', 'Alvo', 'Cemitério', 'Detalhes', 'IP', 'Status'].join(','),
      ...filteredLogs.map(log => [
        log.id,
        format(log.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
        log.userName,
        log.userRole,
        ActionDescriptions[log.action],
        CategoryDescriptions[log.category],
        log.target || '',
        log.cemeteryName || '',
        log.details || '',
        log.ipAddress || '',
        log.success ? 'Sucesso' : 'Erro'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_sistema_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
    link.click();
  };

  const handleClearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
      clearLogs();
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.today} eventos hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Bem Sucedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.success}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}% de sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Falhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-gray-500 mt-1">
              Eventos com erro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Sepultamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.byCategory.BURIAL}</div>
            <p className="text-xs text-gray-500 mt-1">
              Operações registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Logs do Sistema</CardTitle>
              <CardDescription>
                Histórico completo de todas as ações realizadas no sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={handleClearLogs} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de Busca */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuário, ação, alvo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as Categorias</SelectItem>
                {Object.entries(CategoryDescriptions).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAction} onValueChange={(v) => setFilterAction(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as Ações</SelectItem>
                {Object.entries(ActionDescriptions).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Usuários</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Data inicial"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Data final"
            />
          </div>

          {/* Contador de Resultados */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Exibindo {filteredLogs.length} de {logs.length} registros
            </p>
            {(searchTerm || filterCategory !== 'ALL' || filterAction !== 'ALL' || filterUser !== 'ALL' || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('ALL');
                  setFilterAction('ALL');
                  setFilterUser('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Tabela de Logs */}
          <div className="rounded-md border max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Alvo</TableHead>
                  <TableHead>Cemitério</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        #{log.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {format(log.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.userName}</p>
                          <p className="text-xs text-gray-500">{log.userRole}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(log.category)} variant="secondary">
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(log.category)}
                            {CategoryDescriptions[log.category]}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {ActionDescriptions[log.action]}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {log.target || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.cemeteryName || '-'}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-xs text-gray-600">
                        {log.details || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Sucesso
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className={`p-4 rounded-lg ${getCategoryColor(category as LogCategory)}`}>
                  {getCategoryIcon(category as LogCategory)}
                  <p className="mt-2 text-2xl font-bold">{count}</p>
                  <p className="text-xs mt-1">{CategoryDescriptions[category as LogCategory]}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
