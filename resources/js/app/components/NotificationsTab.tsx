import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Bell, Calendar, AlertTriangle, CheckCircle, Clock, MapPin, User, ChevronDown, ChevronUp } from 'lucide-react';
import { format, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getRegularizations, type RegularizationItem } from '@/services/RegularizationService';
import { updateBurial } from '@/services/BurialService';
import { updateLease } from '@/services/LeaseService';
import { apiBurialToFe, apiLeaseToFe, feBurialToApi, feLeaseToApi } from '@/utils/mappers';
import type { Burial as ApiBurial } from '@/services/BurialService';
import type { Lease as ApiLease } from '@/services/LeaseService';

interface NotificationsTabProps {
  selectedCemetery: number | 'all';
  refresh?: number;
  onRegularized?: () => void;
}

export function NotificationsTab({ selectedCemetery, refresh = 0, onRegularized }: NotificationsTabProps) {
  const [filter, setFilter] = useState<'all' | 'burial' | 'lease'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [regulatingId, setRegulatingId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<RegularizationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegularizations = async () => {
    setLoading(true);
    try {
      const cemeteryId = selectedCemetery !== 'all' ? selectedCemetery : undefined;
      const data = await getRegularizations(cemeteryId);
      setNotifications(data);
    } catch (e) {
      console.error('Erro ao carregar regularizações:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegularizations();
  }, [selectedCemetery, refresh]);

  const toggleDetails = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id));

  const handleMarkRegularized = async (notification: RegularizationItem) => {
    setRegulatingId(notification.id);
    try {
      const today = new Date().toISOString().split('T')[0];

      if (notification.type === 'burial') {
        const burial = apiBurialToFe(notification.item as unknown as ApiBurial);
        const years = burial.regularizationPeriodYears ?? 5;
        const nextDate = format(addYears(new Date(today), years), 'yyyy-MM-dd');
        const { id, ...rest } = burial;
        await updateBurial(id, {
          ...feBurialToApi(rest),
          last_regularization_date: today,
          next_regularization_date: nextDate,
        });
      } else {
        const lease = apiLeaseToFe(notification.item as unknown as ApiLease);
        const years = lease.regularizationPeriodYears ?? 5;
        const nextDate = format(addYears(new Date(today), years), 'yyyy-MM-dd');
        const { id, ...rest } = lease;
        await updateLease(id, {
          ...feLeaseToApi(rest),
          last_regularization_date: today,
          next_regularization_date: nextDate,
        });
      }

      onRegularized?.();
      await fetchRegularizations();
    } catch (e) {
      console.error('Erro ao marcar como regularizado:', e);
    } finally {
      setRegulatingId(null);
    }
  };

  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);

  const countByUrgency = {
    high: notifications.filter(n => n.urgency === 'high').length,
    medium: notifications.filter(n => n.urgency === 'medium').length,
    low: notifications.filter(n => n.urgency === 'low').length,
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':   return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      default:       return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getUrgencyVariant = (urgency: string) => {
    switch (urgency) {
      case 'high':   return 'destructive' as const;
      case 'medium': return 'default' as const;
      default:       return 'secondary' as const;
    }
  };

  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Urgente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-3xl font-bold">{countByUrgency.high}</p>
                <p className="text-xs text-gray-500">Requerem atenção imediata</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-3xl font-bold">{countByUrgency.medium}</p>
                <p className="text-xs text-gray-500">Próximas regularizações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Planejado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-3xl font-bold">{countByUrgency.low}</p>
                <p className="text-xs text-gray-500">Para acompanhamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notificações de Regularização</CardTitle>
              <CardDescription>
                Sepultamentos e aforamentos que requerem regularização
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {filtered.length} notificações
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
              <TabsTrigger value="burial">
                Sepultamentos ({notifications.filter(n => n.type === 'burial').length})
              </TabsTrigger>
              <TabsTrigger value="lease">
                Aforamentos ({notifications.filter(n => n.type === 'lease').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma regularização pendente</h3>
                  <p className="text-gray-500">
                    Não há sepultamentos ou aforamentos que precisam de regularização no momento
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map(notification => (
                    <Card
                      key={notification.id}
                      className="border-l-4"
                      style={{
                        borderLeftColor:
                          notification.urgency === 'high' ? '#dc2626' :
                          notification.urgency === 'medium' ? '#ca8a04' : '#2563eb',
                      }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getUrgencyIcon(notification.urgency)}
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-1">{notification.title}</h4>
                                <p className="text-gray-600 mb-2">{notification.description}</p>
                              </div>
                              <Badge variant={getUrgencyVariant(notification.urgency)}>
                                {notification.urgency === 'high' ? 'Urgente' :
                                 notification.urgency === 'medium' ? 'Atenção' : 'Planejado'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{notification.cemeteryName}</p>
                                  <p className="text-xs">{notification.location}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{notification.responsibleName}</p>
                                  <p className="text-xs">{notification.responsiblePhone}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <div>
                                  <p className="text-xs text-gray-500">Anos decorridos</p>
                                  <p className="font-medium">{notification.yearsElapsed} anos</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <div>
                                  <p className="text-xs text-gray-500">Próxima Regularização</p>
                                  <p className="font-medium">{formatDate(notification.nextRegularizationDate)}</p>
                                  <p className="text-xs">
                                    {notification.daysUntilNext < 0
                                      ? `Atrasado ${Math.abs(notification.daysUntilNext)} dias`
                                      : `Em ${notification.daysUntilNext} dias`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleDetails(notification.id)}
                              >
                                {expandedId === notification.id ? (
                                  <><ChevronUp className="w-4 h-4 mr-1" />Ocultar Detalhes</>
                                ) : (
                                  <><ChevronDown className="w-4 h-4 mr-1" />Ver Detalhes</>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                disabled={regulatingId === notification.id}
                                onClick={() => handleMarkRegularized(notification)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {regulatingId === notification.id ? 'Salvando...' : 'Marcar como Regularizado'}
                              </Button>
                            </div>

                            {expandedId === notification.id && (
                              <ItemDetail notification={notification} />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ItemDetail({ notification }: { notification: RegularizationItem }) {
  const item = notification.item as Record<string, string | null>;

  if (notification.type === 'burial') {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm border">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <span className="text-gray-500">GALSC:</span>
          <span>{item.galsc || '—'}</span>
          <span className="text-gray-500">Nº Sepultamento:</span>
          <span>{item.burial_number || '—'}</span>
          <span className="text-gray-500">Tipo:</span>
          <span>{item.burial_type}</span>
          <span className="text-gray-500">Status:</span>
          <span>{item.current_status}</span>
          <span className="text-gray-500">Data Nasc.:</span>
          <span>{item.date_of_birth ? format(new Date(item.date_of_birth), 'dd/MM/yyyy') : '—'}</span>
          <span className="text-gray-500">Data Falec.:</span>
          <span>{item.date_of_death ? format(new Date(item.date_of_death), 'dd/MM/yyyy') : '—'}</span>
          <span className="text-gray-500">Setor:</span>
          <span>{item.sector || '—'}</span>
          <span className="text-gray-500">Última Regulariz.:</span>
          <span>{item.last_regularization_date ? format(new Date(item.last_regularization_date), 'dd/MM/yyyy') : 'Nunca'}</span>
          {item.notes && (
            <>
              <span className="text-gray-500">Obs.:</span>
              <span>{item.notes}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm border">
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <span className="text-gray-500">Tipo:</span>
        <span>{item.lease_type}</span>
        <span className="text-gray-500">Status:</span>
        <span>{item.status}</span>
        <span className="text-gray-500">Valor:</span>
        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.amount))}</span>
        <span className="text-gray-500">Início:</span>
        <span>{item.start_date ? format(new Date(item.start_date), 'dd/MM/yyyy') : '—'}</span>
        <span className="text-gray-500">Vencimento:</span>
        <span>{item.expiry_date ? format(new Date(item.expiry_date), 'dd/MM/yyyy') : 'Perpétuo'}</span>
        <span className="text-gray-500">Setor:</span>
        <span>{item.sector || '—'}</span>
        <span className="text-gray-500">Última Regulariz.:</span>
        <span>{item.last_regularization_date ? format(new Date(item.last_regularization_date), 'dd/MM/yyyy') : 'Nunca'}</span>
        {item.notes && (
          <>
            <span className="text-gray-500">Obs.:</span>
            <span>{item.notes}</span>
          </>
        )}
      </div>
    </div>
  );
}
