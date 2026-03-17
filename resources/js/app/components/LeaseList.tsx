import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Trash2, FileText, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LeaseHistory } from '@/app/components/LeaseHistory';
import { useAuth, Permissions } from '@/contexts/AuthContext';
import type { Lease, Cemetery } from './CemeteryDashboard';

interface LeaseListProps {
  leases: Lease[];
  cemeteries: Cemetery[];
  onDelete: (id: number) => void;
  onEdit: (lease: Lease) => void;
}

export function LeaseList({ leases, cemeteries, onDelete, onEdit }: LeaseListProps) {
  const getCemeteryName = (cemeteryId: number) => {
    return cemeteries.find(c => c.id === cemeteryId)?.name || 'Desconhecido';
  };

  const getCemetery = (cemeteryId: number) => {
    return cemeteries.find(c => c.id === cemeteryId);
  };

  const getPlotHistory = (lease: Lease) => {
    // Retorna todos os aforamentos na mesma localização (quadra + plotNumber + cemitério)
    return leases
      .filter(l => 
        l.cemeteryId === lease.cemeteryId && 
        l.quadra === lease.quadra && 
        l.plotNumber === lease.plotNumber
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

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

  const getStatusBadgeVariant = (status: string) => {
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

  const getLeaseTypeBadgeVariant = (type: string) => {
    return type === 'Perpétuo' ? 'default' : 'outline';
  };

  if (leases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum aforamento cadastrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titular</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Cemitério</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data Início</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leases.map((lease) => {
            const cemetery = getCemetery(lease.cemeteryId);
            const plotHistory = getPlotHistory(lease);
            
            return (
              <TableRow key={lease.id}>
                <TableCell className="font-medium">{lease.leaseholderName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{lease.responsibleName}</div>
                    <div className="text-gray-500">{lease.responsiblePhone}</div>
                  </div>
                </TableCell>
                <TableCell>{getCemeteryName(lease.cemeteryId)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Quadra: {lease.quadra}</div>
                    <div className="text-gray-500">Jazigo: {lease.plotNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getLeaseTypeBadgeVariant(lease.leaseType)}>
                    {lease.leaseType}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(lease.startDate)}</TableCell>
                <TableCell>{formatCurrency(lease.amount)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(lease.status)}>
                    {lease.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {cemetery && (
                    <LeaseHistory 
                      lease={lease} 
                      cemetery={cemetery}
                      plotHistory={plotHistory}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(lease.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lease)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}