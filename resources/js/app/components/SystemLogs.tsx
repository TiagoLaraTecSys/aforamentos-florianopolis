import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  FileText, Search, Clock, User, Activity, AlertTriangle,
  CheckCircle, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/ApiClient';
import {
  getPendingOperations,
  approvePendingOperation,
  rejectPendingOperation,
  type PendingOperation,
} from '@/services/PendingOperationService';

// ─── Audit log types ─────────────────────────────────────────────────────────

interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_role: string | null;
  entity_type: string;
  entity_id: number | null;
  action: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const entityLabel: Record<string, string> = {
  burial:    'Sepultamento',
  lease:     'Aforamento',
  cemiterio: 'Cemitério',
};

const actionLabel: Record<string, string> = {
  created:  'Criado',
  updated:  'Atualizado',
  deleted:  'Excluído',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const actionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (action === 'created' || action === 'approved') return 'default';
  if (action === 'updated') return 'secondary';
  if (action === 'deleted' || action === 'rejected') return 'destructive';
  return 'outline';
};

const operationLabel: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
};

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (status === 'aprovado') return 'default';
  if (status === 'rejeitado') return 'destructive';
  return 'outline';
};

const statusLabel: Record<string, string> = {
  pendente:  'Pendente',
  aprovado:  'Aprovado',
  rejeitado: 'Rejeitado',
};

const formatDate = (d: string) =>
  format(new Date(d), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });

// ─── Component ───────────────────────────────────────────────────────────────

export function SystemLogs() {
  // ── Audit logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logMeta, setLogMeta] = useState({ total: 0, last_page: 1 });
  const [logLoading, setLogLoading] = useState(false);
  const [filterEntity, setFilterEntity] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');

  // ── Pending operations state
  const [pending, setPending] = useState<PendingOperation[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingMeta, setPendingMeta] = useState({ total: 0, last_page: 1 });
  const [pendingLoading, setPendingLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pendente');
  const [pendingRefresh, setPendingRefresh] = useState(0);

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // ── Fetch audit logs
  useEffect(() => {
    setLogLoading(true);
    api.get('/api/audit-logs', {
      params: {
        page: logPage,
        per_page: 20,
        entity_type: filterEntity === 'ALL' ? undefined : filterEntity,
        action: filterAction === 'ALL' ? undefined : filterAction,
      },
    })
      .then(res => {
        const p: Paginated<AuditLog> = res.data;
        setLogs(p.data);
        setLogMeta({ total: p.total, last_page: p.last_page });
      })
      .catch(console.error)
      .finally(() => setLogLoading(false));
  }, [logPage, filterEntity, filterAction]);

  // ── Fetch pending operations
  useEffect(() => {
    setPendingLoading(true);
    getPendingOperations({
      status: filterStatus === 'ALL' ? undefined : filterStatus,
      page: pendingPage,
      per_page: 15,
    })
      .then(res => {
        setPending(res.data);
        setPendingMeta({ total: res.total, last_page: res.last_page });
      })
      .catch(console.error)
      .finally(() => setPendingLoading(false));
  }, [pendingPage, filterStatus, pendingRefresh]);

  const handleApprove = async (id: number) => {
    try {
      await approvePendingOperation(id);
      setPendingRefresh(n => n + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectPendingOperation(id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      setPendingRefresh(n => n + 1);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Operações Pendentes
            {pendingMeta.total > 0 && filterStatus === 'pendente' && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                {pendingMeta.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audit">Logs de Auditoria</TabsTrigger>
        </TabsList>

        {/* ── Pending Operations ───────────────────────────────────────── */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Operações Pendentes</CardTitle>
                  <CardDescription>
                    Operações enviadas por operadores aguardando aprovação
                  </CardDescription>
                </div>
                <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPendingPage(1); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="aprovado">Aprovadas</SelectItem>
                    <SelectItem value="rejeitado">Rejeitadas</SelectItem>
                    <SelectItem value="ALL">Todas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingLoading ? (
                <p className="text-center py-8 text-gray-500">Carregando...</p>
              ) : pending.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nenhuma operação encontrada</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Operação</TableHead>
                        <TableHead>Entidade</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Revisado por</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map(op => (
                        <>
                          <TableRow key={op.id}>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{op.requester?.name ?? `#${op.requested_by}`}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{operationLabel[op.operation_type] ?? op.operation_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{entityLabel[op.entity_type] ?? op.entity_type}</div>
                                {op.entity_id && <div className="text-gray-500">ID #{op.entity_id}</div>}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">{formatDate(op.created_at)}</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(op.status)}>{statusLabel[op.status]}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {op.reviewer?.name ?? (op.reviewed_by ? `#${op.reviewed_by}` : '-')}
                              {op.rejection_reason && (
                                <div className="text-xs text-gray-500 max-w-[160px] truncate" title={op.rejection_reason}>
                                  {op.rejection_reason}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              {op.status === 'pendente' && (
                                <>
                                  <Button size="sm" onClick={() => handleApprove(op.id)}>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setRejectingId(rejectingId === op.id ? null : op.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                          {rejectingId === op.id && (
                            <TableRow key={`reject-${op.id}`}>
                              <TableCell colSpan={7} className="bg-gray-50">
                                <div className="flex items-center gap-2 p-2">
                                  <Input
                                    placeholder="Motivo da rejeição (opcional)"
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button size="sm" variant="destructive" onClick={() => handleReject(op.id)}>
                                    Confirmar Rejeição
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>
                                    Cancelar
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-500">{pendingMeta.total} operação(ões)</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPendingPage(p => p - 1)} disabled={pendingPage <= 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">Página {pendingPage} de {pendingMeta.last_page}</span>
                  <Button variant="outline" size="sm" onClick={() => setPendingPage(p => p + 1)} disabled={pendingPage >= pendingMeta.last_page}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Audit Logs ───────────────────────────────────────────────── */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Logs de Auditoria</CardTitle>
                  <CardDescription>Histórico de todas as operações executadas no sistema</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterEntity} onValueChange={v => { setFilterEntity(v); setLogPage(1); }}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Entidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas</SelectItem>
                      <SelectItem value="burial">Sepultamento</SelectItem>
                      <SelectItem value="lease">Aforamento</SelectItem>
                      <SelectItem value="cemiterio">Cemitério</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterAction} onValueChange={v => { setFilterAction(v); setLogPage(1); }}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas</SelectItem>
                      <SelectItem value="created">Criado</SelectItem>
                      <SelectItem value="updated">Atualizado</SelectItem>
                      <SelectItem value="deleted">Excluído</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {logLoading ? (
                <p className="text-center py-8 text-gray-500">Carregando...</p>
              ) : logs.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nenhum log encontrado</p>
              ) : (
                <div className="rounded-md border overflow-auto max-h-[560px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Entidade</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {formatDate(log.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{log.user_name ?? '—'}</div>
                              <div className="text-xs text-gray-500">{log.user_role ?? ''}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {entityLabel[log.entity_type] ?? log.entity_type}
                          </TableCell>
                          <TableCell>
                            <Badge variant={actionBadgeVariant(log.action)}>
                              {actionLabel[log.action] ?? log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {log.entity_id ? `#${log.entity_id}` : '—'}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-500">
                            {log.ip_address ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-500">{logMeta.total} registro(s)</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setLogPage(p => p - 1)} disabled={logPage <= 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">Página {logPage} de {logMeta.last_page}</span>
                  <Button variant="outline" size="sm" onClick={() => setLogPage(p => p + 1)} disabled={logPage >= logMeta.last_page}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
