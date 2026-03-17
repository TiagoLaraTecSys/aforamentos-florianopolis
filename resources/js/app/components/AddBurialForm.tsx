import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import type { Cemetery, Burial } from './CemeteryDashboard';

interface AddBurialFormProps {
  cemeteries: Cemetery[];
  onAdd: (burial: Omit<Burial, 'id'>) => void;
  onCancel: () => void;
}

export function AddBurialForm({ cemeteries, onAdd, onCancel }: AddBurialFormProps) {
  const [formData, setFormData] = useState({
    cemeteryId: '',
    galsc: '',
    burialNumber: '',
    deceasedName: '',
    dateOfBirth: '',
    dateOfDeath: '',
    burialDate: '',
    quadra: '',
    plotNumber: '',
    sector: '',
    burialType: 'INUMAÇÃO' as 'INUMAÇÃO' | 'TUMULAÇÃO(GAVETA)' | 'EXUMAÇÃO' | 'TRANSLADAÇÃO' | 'CREMAÇÃO' | 'REINUMAÇÃO' | 'OSSÁRIO',
    currentStatus: 'Sepultado' as 'Sepultado' | 'Exumado' | 'Transladado' | 'Cremado',
    responsibleName: '',
    responsiblePhone: '',
    notes: '',
    regularizationPeriodYears: 5,
    nextRegularizationDate: '',
    lastRegularizationDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações - apenas campos essenciais são obrigatórios
    if (!formData.cemeteryId) {
      alert('Selecione um cemitério');
      return;
    }
    
    if (!formData.galsc && !formData.burialNumber) {
      alert('É obrigatório informar GALSC ou Número de Sepultamento');
      return;
    }
    
    if (!formData.deceasedName) {
      alert('Nome do falecido é obrigatório');
      return;
    }
    
    if (!formData.burialDate) {
      alert('Data de sepultamento é obrigatória');
      return;
    }
    
    if (!formData.quadra || !formData.plotNumber) {
      alert('Quadra e número do jazigo são obrigatórios');
      return;
    }

    onAdd(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6 bg-white">
      {/* Seção de Identificação */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Identificação do Sepultamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="galsc">GALSC (Número Único)</Label>
            <Input
              id="galsc"
              value={formData.galsc}
              onChange={(e) => setFormData({ ...formData, galsc: e.target.value })}
              placeholder="Ex: GALSC-2024-0001"
            />
            <p className="text-xs text-gray-500">Sistema novo - nem todos possuem</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="burialNumber">Número de Sepultamento</Label>
            <Input
              id="burialNumber"
              value={formData.burialNumber}
              onChange={(e) => setFormData({ ...formData, burialNumber: e.target.value })}
              placeholder="Ex: 0001"
            />
            <p className="text-xs text-gray-500">Específico deste cemitério</p>
          </div>
        </div>
        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
          * Obrigatório informar pelo menos GALSC ou Número de Sepultamento
        </p>
      </div>

      {/* Seção de Informações do Falecido */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Informações do Falecido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deceasedName">Nome do Falecido *</Label>
            <Input
              id="deceasedName"
              value={formData.deceasedName}
              onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
              placeholder="Nome completo"
              required
            />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfDeath">Data de Falecimento</Label>
            <Input
              id="dateOfDeath"
              type="date"
              value={formData.dateOfDeath}
              onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="burialDate">Data de Sepultamento *</Label>
            <Input
              id="burialDate"
              type="date"
              value={formData.burialDate}
              onChange={(e) => setFormData({ ...formData, burialDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="burialType">Tipo de Sepultura *</Label>
            <Select 
              value={formData.burialType} 
              onValueChange={(value: 'INUMAÇÃO' | 'TUMULAÇÃO(GAVETA)' | 'EXUMAÇÃO' | 'TRANSLADAÇÃO' | 'CREMAÇÃO' | 'REINUMAÇÃO' | 'OSSÁRIO') => 
                setFormData({ ...formData, burialType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INUMAÇÃO">INUMAÇÃO</SelectItem>
                <SelectItem value="TUMULAÇÃO(GAVETA)">TUMULAÇÃO(GAVETA)</SelectItem>
                <SelectItem value="EXUMAÇÃO">EXUMAÇÃO</SelectItem>
                <SelectItem value="TRANSLADAÇÃO">TRANSLADAÇÃO</SelectItem>
                <SelectItem value="CREMAÇÃO">CREMAÇÃO</SelectItem>
                <SelectItem value="REINUMAÇÃO">REINUMAÇÃO</SelectItem>
                <SelectItem value="OSSÁRIO">OSSÁRIO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentStatus">Estado Atual *</Label>
            <Select 
              value={formData.currentStatus} 
              onValueChange={(value: 'Sepultado' | 'Exumado' | 'Transladado' | 'Cremado') => 
                setFormData({ ...formData, currentStatus: value })
              }
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

      {/* Seção de Localização */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Localização</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quadra">Quadra *</Label>
            <Input
              id="quadra"
              value={formData.quadra}
              onChange={(e) => setFormData({ ...formData, quadra: e.target.value })}
              placeholder="Ex: A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plotNumber">Número da Sepultura *</Label>
            <Input
              id="plotNumber"
              value={formData.plotNumber}
              onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
              placeholder="Ex: 123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Setor *</Label>
            <Input
              id="sector"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              placeholder="Ex: Setor A"
              required
            />
          </div>
        </div>
      </div>

      {/* Seção de Responsável */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Responsável</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsibleName">Nome do Responsável *</Label>
            <Input
              id="responsibleName"
              value={formData.responsibleName}
              onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsiblePhone">Telefone do Responsável *</Label>
            <Input
              id="responsiblePhone"
              value={formData.responsiblePhone}
              onChange={(e) => setFormData({ ...formData, responsiblePhone: e.target.value })}
              placeholder="Ex: (11) 99999-9999"
              required
            />
          </div>
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
      </div>

      {/* Seção de Período de Validade/Regularização */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Período de Regularização</h3>
        <p className="text-sm text-gray-600">
          Defina o período para notificações de regularização do sepultamento
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Adicionar Sepultamento
        </Button>
      </div>
    </form>
  );
}