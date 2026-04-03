import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { X, Save } from 'lucide-react';
import type { Lease, Cemetery } from './CemeteryDashboard';
import { extractFieldErrors } from '@/utils/formErrors';

interface EditLeaseFormProps {
  lease: Lease;
  cemeteries: Cemetery[];
  onEdit: (lease: Lease) => Promise<void>;
  onCancel: () => void;
}

export function EditLeaseForm({ lease, cemeteries, onEdit, onCancel }: EditLeaseFormProps) {
  const [formData, setFormData] = useState<Lease>(lease);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await onEdit(formData);
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        console.error('Erro ao editar aforamento:', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const err = (field: string) =>
    errors[field] ? <p className="text-sm text-red-600 mt-1">{errors[field]}</p> : null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Editar Aforamento - {lease.leaseholderName}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Titular */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Dados do Titular</h3>
            <div className="space-y-2">
              <Label>Nome do Titular *</Label>
              <Input
                value={formData.leaseholderName}
                onChange={(e) => setFormData({ ...formData, leaseholderName: e.target.value })}
              />
              {err('leaseholderName')}
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Localização</h3>
            <div className="space-y-2">
              <Label>Cemitério *</Label>
              <Select
                value={formData.cemeteryId.toString()}
                onValueChange={(value) => setFormData({ ...formData, cemeteryId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quadra *</Label>
                <Input
                  value={formData.quadra}
                  onChange={(e) => setFormData({ ...formData, quadra: e.target.value })}
                  placeholder="Ex: A"
                />
                {err('quadra')}
              </div>
              <div className="space-y-2">
                <Label>Jazigo *</Label>
                <Input
                  value={formData.plotNumber}
                  onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                  placeholder="Ex: A-456"
                />
                {err('plotNumber')}
              </div>
              <div className="space-y-2">
                <Label>Setor *</Label>
                <Input
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Ex: Setor A"
                />
                {err('sector')}
              </div>
            </div>
          </div>

          {/* Tipo de Aforamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Tipo de Aforamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
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
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
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
            </div>
          </div>

          {/* Datas e Valores */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Datas e Valores</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                {err('startDate')}
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value || undefined })}
                  disabled={formData.leaseType === 'Perpétuo'}
                />
                {err('expiryDate')}
              </div>
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                />
                {err('amount')}
              </div>
            </div>
          </div>

          {/* Responsável */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Responsável</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Responsável *</Label>
                <Input
                  value={formData.responsibleName}
                  onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                />
                {err('responsibleName')}
              </div>
              <div className="space-y-2">
                <Label>Telefone do Responsável *</Label>
                <Input
                  value={formData.responsiblePhone}
                  onChange={(e) => setFormData({ ...formData, responsiblePhone: e.target.value })}
                />
                {err('responsiblePhone')}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
            {err('notes')}
          </div>

          {/* Regularização (para aforamentos perpétuos) */}
          {formData.leaseType === 'Perpétuo' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Regularização</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Período de Regularização (anos)</Label>
                  <Input
                    type="number"
                    value={formData.regularizationPeriodYears || 5}
                    onChange={(e) => setFormData({ ...formData, regularizationPeriodYears: parseInt(e.target.value) || 5 })}
                    placeholder="Ex: 5"
                  />
                  <p className="text-xs text-gray-500">Padrão: 5 anos</p>
                </div>
                <div className="space-y-2">
                  <Label>Próxima Regularização</Label>
                  <Input
                    type="date"
                    value={formData.nextRegularizationDate || ''}
                    onChange={(e) => setFormData({ ...formData, nextRegularizationDate: e.target.value || undefined })}
                  />
                  <p className="text-xs text-gray-500">Data definida manualmente</p>
                </div>
                <div className="space-y-2">
                  <Label>Última Regularização</Label>
                  <Input
                    type="date"
                    value={formData.lastRegularizationDate || ''}
                    onChange={(e) => setFormData({ ...formData, lastRegularizationDate: e.target.value || undefined })}
                  />
                  <p className="text-xs text-gray-500">Quando foi regularizado</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
