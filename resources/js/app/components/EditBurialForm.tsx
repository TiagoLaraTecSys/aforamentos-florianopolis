import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { X, Save } from 'lucide-react';
import type { Burial, Cemetery } from './CemeteryDashboard';

interface EditBurialFormProps {
  burial: Burial;
  cemeteries: Cemetery[];
  onEdit: (burial: Burial) => void;
  onCancel: () => void;
}

export function EditBurialForm({ burial, cemeteries, onEdit, onCancel }: EditBurialFormProps) {
  const [formData, setFormData] = useState<Burial>(burial);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação: Pelo menos GALSC ou Número de Sepultamento deve estar preenchido
    if (!formData.galsc && !formData.burialNumber) {
      alert('É obrigatório preencher pelo menos o GALSC ou o Número de Sepultamento');
      return;
    }

    if (!formData.deceasedName || !formData.dateOfBirth || !formData.dateOfDeath || 
        !formData.burialDate || !formData.quadra || !formData.plotNumber || 
        !formData.sector || !formData.responsibleName || !formData.responsiblePhone) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onEdit(formData);
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Editar Sepultamento - {burial.deceasedName}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificação */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GALSC (Número Global)</Label>
                <Input
                  value={formData.galsc || ''}
                  onChange={(e) => setFormData({ ...formData, galsc: e.target.value || undefined })}
                  placeholder="Ex: GALSC-2024-0001"
                />
              </div>
              <div className="space-y-2">
                <Label>Número de Sepultamento</Label>
                <Input
                  value={formData.burialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, burialNumber: e.target.value || undefined })}
                  placeholder="Ex: 0001"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              * Pelo menos um dos números acima é obrigatório
            </p>
          </div>

          {/* Dados do Falecido */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Dados do Falecido</h3>
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                required
                value={formData.deceasedName}
                onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data de Nascimento *</Label>
                <Input
                  required
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Falecimento *</Label>
                <Input
                  required
                  type="date"
                  value={formData.dateOfDeath}
                  onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data do Sepultamento *</Label>
                <Input
                  required
                  type="date"
                  value={formData.burialDate}
                  onChange={(e) => setFormData({ ...formData, burialDate: e.target.value })}
                />
              </div>
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
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quadra *</Label>
                <Input
                  required
                  value={formData.quadra}
                  onChange={(e) => setFormData({ ...formData, quadra: e.target.value })}
                  placeholder="Ex: A"
                />
              </div>
              <div className="space-y-2">
                <Label>Sepultura *</Label>
                <Input
                  required
                  value={formData.plotNumber}
                  onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                  placeholder="Ex: 123"
                />
              </div>
              <div className="space-y-2">
                <Label>Setor *</Label>
                <Input
                  required
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Ex: Setor A"
                />
              </div>
            </div>
          </div>

          {/* Tipo de Sepultamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Tipo de Sepultamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.burialType}
                  onValueChange={(value: any) => setFormData({ ...formData, burialType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INUMAÇÃO">INUMAÇÃO</SelectItem>
                    <SelectItem value="TUMULAÇÃO(GAVETA)">TUMULAÇÃO (GAVETA)</SelectItem>
                    <SelectItem value="EXUMAÇÃO">EXUMAÇÃO</SelectItem>
                    <SelectItem value="TRANSLADAÇÃO">TRANSLADAÇÃO</SelectItem>
                    <SelectItem value="CREMAÇÃO">CREMAÇÃO</SelectItem>
                    <SelectItem value="REINUMAÇÃO">REINUMAÇÃO</SelectItem>
                    <SelectItem value="OSSÁRIO">OSSÁRIO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado Atual *</Label>
                <Select
                  value={formData.currentStatus}
                  onValueChange={(value: any) => setFormData({ ...formData, currentStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sepultado">Sepultado</SelectItem>
                    <SelectItem value="Exumado">Exumado</SelectItem>
                    <SelectItem value="Transladado">Transladado</SelectItem>
                    <SelectItem value="Cremado">Cremado</SelectItem>
                  </SelectContent>
                </Select>
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
                  required
                  value={formData.responsibleName}
                  onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone do Responsável *</Label>
                <Input
                  required
                  value={formData.responsiblePhone}
                  onChange={(e) => setFormData({ ...formData, responsiblePhone: e.target.value })}
                />
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
          </div>

          {/* Regularização */}
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

          {/* Botões */}
          <div className="flex gap-2">
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
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