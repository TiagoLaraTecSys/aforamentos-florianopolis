import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { History, MapPin, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Burial, Cemetery } from './CemeteryDashboard';

interface BurialHistoryProps {
  burial: Burial;
  cemetery: Cemetery;
  plotHistory: Burial[]; // Todos os sepultamentos nesta localização
}

export function BurialHistory({ burial, cemetery, plotHistory }: BurialHistoryProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sepultado':
        return 'default';
      case 'Exumado':
        return 'destructive';
      case 'Transladado':
        return 'secondary';
      case 'Cremado':
        return 'outline';
      default:
        return 'default';
    }
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
          <DialogTitle>Histórico Completo</DialogTitle>
          <DialogDescription>
            Informações detalhadas do sepultado e histórico da localização
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Sepultado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-5 h-5" />
                Informações do Sepultado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{burial.deceasedName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado Atual</p>
                  <Badge variant={getStatusColor(burial.currentStatus)}>
                    {burial.currentStatus}
                  </Badge>
                </div>
                {burial.galsc && (
                  <div>
                    <p className="text-sm text-gray-500">GALSC</p>
                    <p className="font-medium">{burial.galsc}</p>
                  </div>
                )}
                {burial.burialNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Nº Sepultamento</p>
                    <p className="font-medium">{burial.burialNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Data de Nascimento</p>
                  <p className="font-medium">{burial.dateOfBirth ? formatDate(burial.dateOfBirth) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Falecimento</p>
                  <p className="font-medium">{formatDate(burial.dateOfDeath)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Sepultamento</p>
                  <p className="font-medium">{formatDate(burial.burialDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-medium">{burial.burialType}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Responsável</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">{burial.responsibleName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{burial.responsiblePhone}</p>
                  </div>
                </div>
              </div>

              {burial.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Observações</p>
                  <p className="text-sm">{burial.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localização Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                Localização Atual
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
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quadra</p>
                    <p className="font-medium">{burial.quadra}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sepultura</p>
                    <p className="font-medium">{burial.plotNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Setor</p>
                    <p className="font-medium">{burial.sector}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico da Sepultura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5" />
                Histórico da Localização {burial.quadra} - {burial.plotNumber}
              </CardTitle>
              <CardDescription>
                Todos os sepultamentos realizados nesta localização
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
                        historic.id === burial.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{plotHistory.length - index}
                          </span>
                          <h4 className="font-medium">{historic.deceasedName}</h4>
                          {historic.id === burial.id && (
                            <Badge variant="secondary" className="text-xs">Atual</Badge>
                          )}
                        </div>
                        <Badge variant={getStatusColor(historic.currentStatus)}>
                          {historic.currentStatus}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {historic.galsc && (
                          <div>
                            <p className="text-gray-500">GALSC</p>
                            <p className="font-medium">{historic.galsc}</p>
                          </div>
                        )}
                        {historic.burialNumber && (
                          <div>
                            <p className="text-gray-500">Nº Sepultamento</p>
                            <p className="font-medium">{historic.burialNumber}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500">Data</p>
                          <p className="font-medium">{formatDate(historic.burialDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tipo</p>
                          <p className="font-medium text-xs">{historic.burialType}</p>
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