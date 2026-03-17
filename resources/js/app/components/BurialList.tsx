import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Trash2, FileText, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BurialHistory } from '@/app/components/BurialHistory';
import { useAuth, Permissions } from '@/contexts/AuthContext';
import type { Burial, Cemetery } from './CemeteryDashboard';

interface BurialListProps {
  burials: Burial[];
  cemeteries: Cemetery[];
  onDelete: (id: number) => void;
  onEdit: (burial: Burial) => void;
}

export function BurialList({ burials, cemeteries, onDelete, onEdit }: BurialListProps) {
  const getCemeteryName = (cemeteryId: number) => {
    return cemeteries.find(c => c.id === cemeteryId)?.name || 'Desconhecido';
  };

  const getCemetery = (cemeteryId: number) => {
    return cemeteries.find(c => c.id === cemeteryId);
  };

  const getPlotHistory = (burial: Burial) => {
    // Retorna todos os sepultamentos na mesma localização (quadra + plotNumber + cemitério)
    return burials
      .filter(b => 
        b.cemeteryId === burial.cemeteryId && 
        b.quadra === burial.quadra && 
        b.plotNumber === burial.plotNumber
      )
      .sort((a, b) => new Date(a.burialDate).getTime() - new Date(b.burialDate).getTime());
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getGraveTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'INUMAÇÃO':
      case 'REINUMAÇÃO':
        return 'default';
      case 'TUMULAÇÃO(GAVETA)':
        return 'secondary';
      case 'CREMAÇÃO':
        return 'outline';
      case 'EXUMAÇÃO':
      case 'TRANSLADAÇÃO':
        return 'destructive';
      case 'OSSÁRIO':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (burials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum sepultamento cadastrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identificação</TableHead>
            <TableHead>Nome do Falecido</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Cemitério</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {burials.map((burial) => {
            const cemetery = getCemetery(burial.cemeteryId);
            const plotHistory = getPlotHistory(burial);
            
            return (
              <TableRow key={burial.id}>
                <TableCell>
                  <div className="text-sm">
                    {burial.galsc && (
                      <div className="font-medium">GALSC: {burial.galsc}</div>
                    )}
                    {burial.burialNumber && (
                      <div className="text-gray-500">Nº: {burial.burialNumber}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{burial.deceasedName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{burial.responsibleName}</div>
                    <div className="text-gray-500">{burial.responsiblePhone}</div>
                  </div>
                </TableCell>
                <TableCell>{getCemeteryName(burial.cemeteryId)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Quadra: {burial.quadra}</div>
                    <div className="text-gray-500">Sepultura: {burial.plotNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getGraveTypeBadgeVariant(burial.burialType)} className="text-xs">
                    {burial.burialType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    burial.currentStatus === 'Sepultado' ? 'default' :
                    burial.currentStatus === 'Exumado' ? 'destructive' :
                    burial.currentStatus === 'Transladado' ? 'secondary' : 'outline'
                  }>
                    {burial.currentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {cemetery && (
                    <BurialHistory 
                      burial={burial} 
                      cemetery={cemetery}
                      plotHistory={plotHistory}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(burial.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(burial)}
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