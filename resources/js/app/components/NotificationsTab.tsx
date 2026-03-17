import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Bell, Calendar, AlertTriangle, CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { format, differenceInDays, addYears, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Burial, Lease, Cemetery } from './CemeteryDashboard';

interface NotificationsTabProps {
  burials: Burial[];
  leases: Lease[];
  cemeteries: Cemetery[];
}

interface Notification {
  id: string;
  type: 'burial' | 'lease';
  itemId: number;
  title: string;
  description: string;
  date: Date;
  urgency: 'high' | 'medium' | 'low';
  yearsElapsed: number;
  nextRegularization: Date;
  daysUntilNext: number;
  cemeteryName: string;
  location: string;
  responsibleName: string;
  responsiblePhone: string;
}

export function NotificationsTab({ burials, leases, cemeteries }: NotificationsTabProps) {
  const [filter, setFilter] = useState<'all' | 'burial' | 'lease'>('all');

  const getCemeteryName = (cemeteryId: number) => {
    return cemeteries.find(c => c.id === cemeteryId)?.name || 'Desconhecido';
  };

  const calculateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];
    const today = new Date();

    // Notificações de Sepultamentos (a cada 5 anos)
    burials.forEach(burial => {
      const burialDate = new Date(burial.burialDate);
      const yearsElapsed = differenceInYears(today, burialDate);
      
      // Verifica se está próximo de um período de regularização (5, 10, 15, 20 anos, etc.)
      const nextRegularizationYears = Math.ceil(yearsElapsed / 5) * 5;
      const nextRegularization = addYears(burialDate, nextRegularizationYears);
      const daysUntilNext = differenceInDays(nextRegularization, today);

      // Notifica se está dentro de 90 dias antes ou 30 dias depois
      if (daysUntilNext <= 90 && daysUntilNext >= -30) {
        let urgency: 'high' | 'medium' | 'low' = 'low';
        if (daysUntilNext < 0) {
          urgency = 'high'; // Atrasado
        } else if (daysUntilNext <= 30) {
          urgency = 'high'; // Menos de 30 dias
        } else if (daysUntilNext <= 60) {
          urgency = 'medium'; // Entre 30-60 dias
        }

        notifications.push({
          id: `burial-${burial.id}`,
          type: 'burial',
          itemId: burial.id,
          title: `Regularização de Sepultamento - ${burial.deceasedName}`,
          description: `${nextRegularizationYears} anos de sepultamento. ${
            daysUntilNext < 0 
              ? `Atrasado há ${Math.abs(daysUntilNext)} dias`
              : `Regularizar em ${daysUntilNext} dias`
          }`,
          date: burialDate,
          urgency,
          yearsElapsed,
          nextRegularization,
          daysUntilNext,
          cemeteryName: getCemeteryName(burial.cemeteryId),
          location: `Quadra ${burial.quadra} - Sepultura ${burial.plotNumber}`,
          responsibleName: burial.responsibleName,
          responsiblePhone: burial.responsiblePhone
        });
      }
    });

    // Notificações de Aforamentos (vencimento ou renovação a cada 5 anos para temporários)
    leases.forEach(lease => {
      if (lease.leaseType === 'Temporário' && lease.expiryDate) {
        const expiryDate = new Date(lease.expiryDate);
        const daysUntilExpiry = differenceInDays(expiryDate, today);

        // Notifica se está dentro de 90 dias antes ou já venceu
        if (daysUntilExpiry <= 90) {
          let urgency: 'high' | 'medium' | 'low' = 'low';
          if (daysUntilExpiry < 0) {
            urgency = 'high'; // Vencido
          } else if (daysUntilExpiry <= 30) {
            urgency = 'high'; // Menos de 30 dias
          } else if (daysUntilExpiry <= 60) {
            urgency = 'medium'; // Entre 30-60 dias
          }

          notifications.push({
            id: `lease-${lease.id}`,
            type: 'lease',
            itemId: lease.id,
            title: `Renovação de Aforamento - ${lease.leaseholderName}`,
            description: `${
              daysUntilExpiry < 0 
                ? `Vencido há ${Math.abs(daysUntilExpiry)} dias`
                : `Vence em ${daysUntilExpiry} dias`
            }`,
            date: new Date(lease.startDate),
            urgency,
            yearsElapsed: differenceInYears(today, new Date(lease.startDate)),
            nextRegularization: expiryDate,
            daysUntilNext: daysUntilExpiry,
            cemeteryName: getCemeteryName(lease.cemeteryId),
            location: `Quadra ${lease.quadra} - Jazigo ${lease.plotNumber}`,
            responsibleName: lease.responsibleName,
            responsiblePhone: lease.responsiblePhone
          });
        }
      } else if (lease.leaseType === 'Perpétuo') {
        // Para aforamentos perpétuos, verificar regularização a cada 5 anos
        const startDate = new Date(lease.startDate);
        const yearsElapsed = differenceInYears(today, startDate);
        
        const nextRegularizationYears = Math.ceil(yearsElapsed / 5) * 5;
        const nextRegularization = addYears(startDate, nextRegularizationYears);
        const daysUntilNext = differenceInDays(nextRegularization, today);

        if (daysUntilNext <= 90 && daysUntilNext >= -30) {
          let urgency: 'high' | 'medium' | 'low' = 'low';
          if (daysUntilNext < 0) {
            urgency = 'high';
          } else if (daysUntilNext <= 30) {
            urgency = 'high';
          } else if (daysUntilNext <= 60) {
            urgency = 'medium';
          }

          notifications.push({
            id: `lease-perp-${lease.id}`,
            type: 'lease',
            itemId: lease.id,
            title: `Regularização de Aforamento Perpétuo - ${lease.leaseholderName}`,
            description: `${nextRegularizationYears} anos de aforamento. ${
              daysUntilNext < 0 
                ? `Atrasado há ${Math.abs(daysUntilNext)} dias`
                : `Regularizar em ${daysUntilNext} dias`
            }`,
            date: startDate,
            urgency,
            yearsElapsed,
            nextRegularization,
            daysUntilNext,
            cemeteryName: getCemeteryName(lease.cemeteryId),
            location: `Quadra ${lease.quadra} - Jazigo ${lease.plotNumber}`,
            responsibleName: lease.responsibleName,
            responsiblePhone: lease.responsiblePhone
          });
        }
      }
    });

    // Ordenar por urgência e dias até regularização
    return notifications.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return a.daysUntilNext - b.daysUntilNext;
    });
  };

  const allNotifications = calculateNotifications();
  const filteredNotifications = allNotifications.filter(n => 
    filter === 'all' || n.type === filter
  );

  const countByUrgency = {
    high: allNotifications.filter(n => n.urgency === 'high').length,
    medium: allNotifications.filter(n => n.urgency === 'medium').length,
    low: allNotifications.filter(n => n.urgency === 'low').length
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Resumo de Notificações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Urgente
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-500">
              Atenção
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-500">
              Planejado
            </CardTitle>
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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notificações de Regularização</CardTitle>
              <CardDescription>
                Acompanhamento de sepultamentos e aforamentos que requerem regularização a cada 5 anos
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {filteredNotifications.length} notificações
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">
                Todas ({allNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="burial">
                Sepultamentos ({allNotifications.filter(n => n.type === 'burial').length})
              </TabsTrigger>
              <TabsTrigger value="lease">
                Aforamentos ({allNotifications.filter(n => n.type === 'lease').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma regularização pendente</h3>
                  <p className="text-gray-500">
                    Não há sepultamentos ou aforamentos que precisam de regularização no momento
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map(notification => (
                    <Card key={notification.id} className="border-l-4" style={{
                      borderLeftColor: notification.urgency === 'high' ? '#dc2626' : 
                                      notification.urgency === 'medium' ? '#ca8a04' : '#2563eb'
                    }}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getUrgencyIcon(notification.urgency)}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-1">
                                  {notification.title}
                                </h4>
                                <p className="text-gray-600 mb-2">
                                  {notification.description}
                                </p>
                              </div>
                              <Badge variant={getUrgencyColor(notification.urgency)}>
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
                                  <p className="text-xs text-gray-500">Data Original</p>
                                  <p className="font-medium">{formatDate(notification.date)}</p>
                                  <p className="text-xs">({notification.yearsElapsed} anos)</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <div>
                                  <p className="text-xs text-gray-500">Próxima Regularização</p>
                                  <p className="font-medium">{formatDate(notification.nextRegularization)}</p>
                                  <p className="text-xs">
                                    {notification.daysUntilNext < 0 
                                      ? `Atrasado ${Math.abs(notification.daysUntilNext)} dias`
                                      : `Em ${notification.daysUntilNext} dias`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline">
                                Ver Detalhes
                              </Button>
                              <Button size="sm">
                                Marcar como Regularizado
                              </Button>
                            </div>
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
