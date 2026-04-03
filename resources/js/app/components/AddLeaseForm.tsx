import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import type { Cemetery, Lease } from './CemeteryDashboard';
import { extractFieldErrors } from '@/utils/formErrors';

interface AddLeaseFormProps {
  cemeteries: Cemetery[];
  onAdd: (lease: Omit<Lease, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function AddLeaseForm({ cemeteries, onAdd, onCancel }: AddLeaseFormProps) {
  const [formData, setFormData] = useState({
    cemeteryId: '',
    leaseholderName: '',
    quadra: '',
    plotNumber: '',
    sector: '',
    leaseType: 'Perpétuo' as 'Perpétuo' | 'Temporário',
    startDate: '',
    expiryDate: '',
    status: 'Ativo' as 'Ativo' | 'Vencido' | 'Renovado',
    amount: '',
    responsibleName: '',
    responsiblePhone: '',
    notes: '',
    regularizationPeriodYears: 5,
    nextRegularizationDate: '',
    lastRegularizationDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await onAdd({
        cemeteryId: parseInt(formData.cemeteryId),
        leaseholderName: formData.leaseholderName,
        quadra: formData.quadra,
        plotNumber: formData.plotNumber,
        sector: formData.sector,
        leaseType: formData.leaseType,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate || undefined,
        status: formData.status,
        amount: parseFloat(formData.amount),
        responsibleName: formData.responsibleName,
        responsiblePhone: formData.responsiblePhone,
        notes: formData.notes,
        regularizationPeriodYears: formData.regularizationPeriodYears,
        nextRegularizationDate: formData.nextRegularizationDate || undefined,
        lastRegularizationDate: formData.lastRegularizationDate || undefined
      });
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        console.error('Erro ao adicionar aforamento:', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const err = (field: string) =>
    errors[field] ? <p className="text-sm text-red-600 mt-1">{errors[field]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="leaseholderName">Nome do Titular *</Label>
          <Input
            id="leaseholderName"
            value={formData.leaseholderName}
            onChange={(e) => setFormData({ ...formData, leaseholderName: e.target.value })}
            placeholder="Nome completo"
          />
          {err('leaseholderName')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cemetery">Cemitério *</Label>
          <Select
            value={formData.cemeteryId}
            onValueChange={(value) => setFormData({ ...formData, cemeteryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cemitério" />
            </SelectTrigger>
            <SelectContent>
              {cemeteries.map((cemetery) => (
                <SelectItem key={cemetery.id} value={cemetery.id.toString()}>
                  {cemetery.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err('cemeteryId')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector">Setor *</Label>
          <Input
            id="sector"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            placeholder="Ex: Setor A"
          />
          {err('sector')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quadra">Quadra *</Label>
          <Input
            id="quadra"
            value={formData.quadra}
            onChange={(e) => setFormData({ ...formData, quadra: e.target.value })}
            placeholder="Ex: A"
          />
          {err('quadra')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="plotNumber">Número do Jazigo *</Label>
          <Input
            id="plotNumber"
            value={formData.plotNumber}
            onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
            placeholder="Ex: A-456"
          />
          {err('plotNumber')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="leaseType">Tipo de Aforamento *</Label>
          <Select
            value={formData.leaseType}
            onValueChange={(value: 'Perpétuo' | 'Temporário') =>
              setFormData({ ...formData, leaseType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Perpétuo">Perpétuo</SelectItem>
              <SelectItem value="Temporário">Temporário</SelectItem>
            </SelectContent>
          </Select>
          {err('leaseType')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'Ativo' | 'Vencido' | 'Renovado') =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Vencido">Vencido</SelectItem>
              <SelectItem value="Renovado">Renovado</SelectItem>
            </SelectContent>
          </Select>
          {err('status')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Início *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          {err('startDate')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Data de Vencimento</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
          {err('expiryDate')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
          />
          {err('amount')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsibleName">Nome do Responsável *</Label>
          <Input
            id="responsibleName"
            value={formData.responsibleName}
            onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
            placeholder="Nome completo"
          />
          {err('responsibleName')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsiblePhone">Telefone do Responsável *</Label>
          <Input
            id="responsiblePhone"
            value={formData.responsiblePhone}
            onChange={(e) => setFormData({ ...formData, responsiblePhone: e.target.value })}
            placeholder="(XX) XXXX-XXXX"
          />
          {err('responsiblePhone')}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informações adicionais..."
          rows={3}
        />
        {err('notes')}
      </div>

      {/* Seção de Período de Validade/Regularização */}
      {formData.leaseType === 'Perpétuo' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Período de Regularização</h3>
          <p className="text-sm text-gray-600">
            Defina o período para notificações de regularização do aforamento perpétuo
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regularizationPeriodYears">Período (anos)</Label>
              <Input
                id="regularizationPeriodYears"
                type="number"
                min="1"
                max="50"
                value={formData.regularizationPeriodYears}
                onChange={(e) => setFormData({ ...formData, regularizationPeriodYears: parseInt(e.target.value) || 5 })}
                placeholder="Ex: 5"
              />
              <p className="text-xs text-gray-500">Padrão: 5 anos</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextRegularizationDate">Próxima Regularização</Label>
              <Input
                id="nextRegularizationDate"
                type="date"
                value={formData.nextRegularizationDate}
                onChange={(e) => setFormData({ ...formData, nextRegularizationDate: e.target.value })}
              />
              <p className="text-xs text-gray-500">Define data específica</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastRegularizationDate">Última Regularização</Label>
              <Input
                id="lastRegularizationDate"
                type="date"
                value={formData.lastRegularizationDate}
                onChange={(e) => setFormData({ ...formData, lastRegularizationDate: e.target.value })}
              />
              <p className="text-xs text-gray-500">Quando foi regularizado</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Adicionar Aforamento'}
        </Button>
      </div>
    </form>
  );
}
