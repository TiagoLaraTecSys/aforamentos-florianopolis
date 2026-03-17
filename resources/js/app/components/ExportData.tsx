import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import type { Burial, Lease, Cemetery } from './CemeteryDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExportDataProps {
  burials: Burial[];
  leases: Lease[];
  cemeteries: Cemetery[];
}

export function ExportData({ burials, leases, cemeteries }: ExportDataProps) {
  const getCemeteryName = (cemeteryId: number) => {
    return cemeteries.find(c => c.id === cemeteryId)?.name || 'Desconhecido';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const convertToCSV = (data: any[], headers: string[]) => {
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] ?? '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBurials = () => {
    const data = burials.map(burial => ({
      'ID': burial.id,
      'GALSC': burial.galsc || '',
      'Número Sepultamento': burial.burialNumber || '',
      'Nome Falecido': burial.deceasedName,
      'Data Nascimento': formatDate(burial.dateOfBirth),
      'Data Óbito': formatDate(burial.dateOfDeath),
      'Data Sepultamento': formatDate(burial.burialDate),
      'Cemitério': getCemeteryName(burial.cemeteryId),
      'Quadra': burial.quadra,
      'Sepultura': burial.plotNumber,
      'Tipo Sepultamento': burial.burialType,
      'Status Atual': burial.currentStatus,
      'Nome Responsável': burial.responsibleName,
      'Telefone Responsável': burial.responsiblePhone,
      'Próxima Regularização': burial.nextRegularizationDate ? formatDate(burial.nextRegularizationDate) : '',
      'Observações': burial.notes || ''
    }));

    const headers = Object.keys(data[0] || {});
    const csv = convertToCSV(data, headers);
    downloadCSV(csv, `sepultamentos_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
  };

  const exportLeases = () => {
    const data = leases.map(lease => ({
      'ID': lease.id,
      'Titular': lease.leaseholderName,
      'Cemitério': getCemeteryName(lease.cemeteryId),
      'Quadra': lease.quadra,
      'Jazigo': lease.plotNumber,
      'Tipo Aforamento': lease.leaseType,
      'Data Início': formatDate(lease.startDate),
      'Data Vencimento': lease.expiryDate ? formatDate(lease.expiryDate) : '',
      'Status': lease.status,
      'Valor': lease.amount,
      'Nome Responsável': lease.responsibleName,
      'Telefone Responsável': lease.responsiblePhone,
      'Próxima Regularização': lease.nextRegularizationDate ? formatDate(lease.nextRegularizationDate) : '',
      'Observações': lease.notes || ''
    }));

    const headers = Object.keys(data[0] || {});
    const csv = convertToCSV(data, headers);
    downloadCSV(csv, `aforamentos_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
  };

  const exportCemeteries = () => {
    const data = cemeteries.map(cemetery => ({
      'ID': cemetery.id,
      'Nome': cemetery.name,
      'Localização': cemetery.location,
      'Endereço': cemetery.address,
      'Total Jazigos': cemetery.totalPlots,
      'Jazigos Ocupados': cemetery.occupiedPlots,
      'Taxa Ocupação': `${((cemetery.occupiedPlots / cemetery.totalPlots) * 100).toFixed(1)}%`
    }));

    const headers = Object.keys(data[0] || {});
    const csv = convertToCSV(data, headers);
    downloadCSV(csv, `cemiterios_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
  };

  const exportAll = () => {
    exportBurials();
    setTimeout(() => exportLeases(), 300);
    setTimeout(() => exportCemeteries(), 600);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={exportBurials}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Exportar Sepultamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            {burials.length} registros
          </p>
          <Button variant="outline" className="w-full" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={exportLeases}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Exportar Aforamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            {leases.length} registros
          </p>
          <Button variant="outline" className="w-full" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={exportCemeteries}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            Exportar Cemitérios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            {cemeteries.length} registros
          </p>
          <Button variant="outline" className="w-full" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-50" onClick={exportAll}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            Exportar Tudo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Todos os dados do sistema
          </p>
          <Button className="w-full" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar Tudo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
