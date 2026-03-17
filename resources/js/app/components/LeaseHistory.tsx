import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { History, MapPin, Info, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Lease, Cemetery } from './CemeteryDashboard';

interface LeaseHistoryProps {
  lease: Lease;
  cemetery: Cemetery;
  plotHistory: Lease[]; // Todos os aforamentos nesta localização
}

export function LeaseHistory({ lease, cemetery, plotHistory }: LeaseHistoryProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'default';
      case 'Vencido':
        return 'destructive';
      case 'Renovado':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'Perpétuo' ? 'default' : 'outline';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="w-4 h-4 mr-2" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico do Aforamento</DialogTitle>
          <DialogDescription>
            Informações detalhadas do aforamento e histórico da localização
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Aforamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-5 h-5" />
                Informações do Aforamento Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Titular</p>
                  <p className="font-medium">{lease.leaseholderName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusColor(lease.status)}>
                    {lease.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de Aforamento</p>
                  <Badge variant={getTypeColor(lease.leaseType)}>
                    {lease.leaseType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="font-medium">{formatCurrency(lease.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Início</p>
                  <p className="font-medium">{formatDate(lease.startDate)}</p>
                </div>
                {lease.expiryDate && (
                  <div>
                    <p className="text-sm text-gray-500">Data de Vencimento</p>
                    <p className="font-medium">{formatDate(lease.expiryDate)}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Responsável</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">{lease.responsibleName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{lease.responsiblePhone}</p>
                  </div>
                </div>
              </div>

              {lease.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Observações</p>
                  <p className="text-sm">{lease.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cemitério</p>
                  <p className="font-medium">{cemetery.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Endereço</p>
                  <p className="text-sm">{cemetery.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quadra</p>
                    <p className="font-medium">{lease.quadra}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jazigo</p>
                    <p className="font-medium">{lease.plotNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Setor</p>
                    <p className="font-medium">{lease.sector}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico da Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5" />
                Histórico da Localização {lease.quadra} - {lease.plotNumber}
              </CardTitle>
              <CardDescription>
                Todos os aforamentos realizados nesta localização
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plotHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum histórico adicional encontrado
                </p>
              ) : (
                <div className="space-y-4">
                  {plotHistory.map((historic, index) => (
                    <div
                      key={historic.id}
                      className={`p-4 border rounded-lg ${
                        historic.id === lease.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{plotHistory.length - index}
                          </span>
                          <h4 className="font-medium">{historic.leaseholderName}</h4>
                          {historic.id === lease.id && (
                            <Badge variant="secondary" className="text-xs">Atual</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusColor(historic.status)}>
                            {historic.status}
                          </Badge>
                          <Badge variant={getTypeColor(historic.leaseType)}>
                            {historic.leaseType}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Data Início</p>
                          <p className="font-medium">{formatDate(historic.startDate)}</p>
                        </div>
                        {historic.expiryDate && (
                          <div>
                            <p className="text-gray-500">Vencimento</p>
                            <p className="font-medium">{formatDate(historic.expiryDate)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500">Valor</p>
                          <p className="font-medium">{formatCurrency(historic.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Responsável</p>
                          <p className="font-medium text-xs">{historic.responsibleName}</p>
                          <p className="text-gray-400 text-xs">{historic.responsiblePhone}</p>
                        </div>
                      </div>
                      
                      {historic.notes && (
                        <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
                          {historic.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
