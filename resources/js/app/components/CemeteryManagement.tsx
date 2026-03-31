import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, Pencil, Trash2, Save, X, Building2, Info } from 'lucide-react';
import type { Cemetery, CreateCemiterioDTO } from '@/services/CemiterioService';
import * as CemiteryService from '@/services/CemiterioService';
import { useEffect } from 'react';

interface CemeteryManagementProps {
  cemeteries: Cemetery[];
  onUpdate: (cemeteries: Cemetery[]) => void;
}

export function CemeteryManagement({ cemeteries, onUpdate }: CemeteryManagementProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Cemetery>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<string, string[]>>({})
  const [newCemetery, setNewCemetery] = useState<Omit<Cemetery, 'id'>>({
    name: '',
    location: '',
    address: '',
    totalPlots: 0,
    occupiedPlots: 0,
    totalQuadras: 0,
    plotsPerQuadra: 0,
    cemeteryType: 'Municipal',
    hasOssuary: false,
    hasColumbarium: false
  });

  const loadCemeteries = async () => {
    try {
      const data = await CemiteryService.getCemiterios();
      onUpdate(data);
    } catch (error) {
      console.error('Erro ao carregar cemitérios', error);
    }
  };

  const handleEdit = (cemetery: Cemetery) => {
    setEditingId(cemetery.id);
    setEditForm(cemetery);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    CemiteryService.updateCemiterio(editingId, editForm)
    .then(updated => {
        const updatedCemeteries = cemeteries.map(c =>
              c.id === editingId ? { ...c, ...updated } : c
        );
        onUpdate(updatedCemeteries);
        setEditingId(null);
        setEditForm({});
    }).catch(err => {
        if (err.response?.status === 422) {
            setUpdateErrors(err.response.data.errors);
        } else {
            alert('Erro inesperado ao salvar');
        }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cemitério? Todos os registros relacionados serão afetados.')) {

      try {
          await CemiteryService.deleteCemiterio(id);
          await loadCemeteries();
      } catch(err: any) {
          alert(JSON.stringify(err));
      }
    }
  };

  const handleAdd = async () => {
      setIsAdding(true);
    try {
        await CemiteryService.createCemiterio(newCemetery);
        await loadCemeteries();

        setNewCemetery({
          name: '',
          location: '',
          address: '',
          totalPlots: 0,
          occupiedPlots: 0,
          totalQuadras: 0,
          plotsPerQuadra: 0,
          cemeteryType: 'Municipal',
          hasOssuary: false,
          hasColumbarium: false
        });
        setIsAdding(false);
    } catch(err: any) {
        if (err.response?.status === 422) {
            setErrors(err.response.data.errors);
        } else {
            alert('Erro inesperado ao salvar');
        }
    }

  };

  const occupancyRate = (cemetery: Partial<Cemetery>) => {
    if (!cemetery.totalPlots || cemetery.totalPlots === 0) return '0';
    return (((cemetery.occupiedPlots || 0) / cemetery.totalPlots) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Gerenciamento de Cemitérios
              </CardTitle>
              <CardDescription>
                Gerencie informações completas dos cemitérios, incluindo quadras, sepulturas e infraestrutura
              </CardDescription>
            </div>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cemitério
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Novo Cemitério</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="structure">Estrutura</TabsTrigger>
                    <TabsTrigger value="contact">Contato</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Cemitério *</Label>
                        <Input
                          value={newCemetery.name}
                          onChange={(e) => setNewCemetery({ ...newCemetery, name: e.target.value })}
                          placeholder="Ex: SÃO FRANCISCO DE ASSIS"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Localização/Bairro *</Label>
                        <Input
                          value={newCemetery.location}
                          onChange={(e) => setNewCemetery({ ...newCemetery, location: e.target.value })}
                          placeholder="Ex: Itacorubi"
                        />
                        {errors.location && (
                           <p className="text-red-500 text-sm mt-1">{errors.location[0]}</p>
                         )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Endereço Completo *</Label>
                      <Input
                        value={newCemetery.address}
                        onChange={(e) => setNewCemetery({ ...newCemetery, address: e.target.value })}
                        placeholder="Ex: Rua Pastor William Richard Schisler Filho, nº 452, Itacorubi, Florianópolis – SC"
                      />
                        {errors.address && (
                           <p className="text-red-500 text-sm mt-1">{errors.address[0]}</p>
                         )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Cemitério</Label>
                        <Select
                          value={newCemetery.cemeteryType}
                          onValueChange={(value: 'Municipal' | 'Particular' | 'Paroquial') =>
                            setNewCemetery({ ...newCemetery, cemeteryType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Municipal">Municipal</SelectItem>
                            <SelectItem value="Particular">Particular</SelectItem>
                            <SelectItem value="Paroquial">Paroquial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ano de Fundação</Label>
                        <Input
                          type="number"
                          value={newCemetery.yearEstablished || ''}
                          onChange={(e) => setNewCemetery({ ...newCemetery, yearEstablished: parseInt(e.target.value) || undefined })}
                          placeholder="Ex: 1950"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Área (m²)</Label>
                        <Input
                          type="number"
                          value={newCemetery.areaSize || ''}
                          onChange={(e) => setNewCemetery({ ...newCemetery, areaSize: parseInt(e.target.value) || undefined })}
                          placeholder="Ex: 50000"
                        />
                        {errors.areaSize && (
                            <p className="text-red-500 text-sm mt-1">{errors.areaSize[0]}</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="structure" className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Total de Quadras *</Label>
                        <Input
                          type="number"
                          value={newCemetery.totalQuadras}
                          onChange={(e) => setNewCemetery({ ...newCemetery, totalQuadras: parseInt(e.target.value) || 0 })}
                          placeholder="Ex: 15"
                        />
                        {errors.totalQuadras && (
                            <p className="text-red-500 text-sm mt-1">{errors.totalQuadras[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Sepulturas por Quadra</Label>
                        <Input
                          type="number"
                          value={newCemetery.plotsPerQuadra || ''}
                          onChange={(e) => setNewCemetery({ ...newCemetery, plotsPerQuadra: parseInt(e.target.value) || undefined })}
                          placeholder="Ex: 100"
                        />
                        {errors.plotsPerQuadra && (
                            <p className="text-red-500 text-sm mt-1">{errors.plotsPerQuadra[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Total de Jazigos</Label>
                        <Input
                          type="number"
                          value={newCemetery.totalPlots}
                          onChange={(e) => setNewCemetery({ ...newCemetery, totalPlots: parseInt(e.target.value) || 0 })}
                          placeholder="Ex: 1500"
                        />
                        {errors.totalPlots && (
                            <p className="text-red-500 text-sm mt-1">{errors.totalQuadras[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Jazigos Ocupados</Label>
                        <Input
                          type="number"
                          value={newCemetery.occupiedPlots}
                          onChange={(e) => setNewCemetery({ ...newCemetery, occupiedPlots: parseInt(e.target.value) || 0 })}
                          placeholder="Ex: 1200"
                        />
                        {errors.occupiedPlots && (
                            <p className="text-red-500 text-sm mt-1">{errors.occupiedPlots[0]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <input
                          type="checkbox"
                          id="hasOssuary"
                          checked={newCemetery.hasOssuary}
                          onChange={(e) => setNewCemetery({ ...newCemetery, hasOssuary: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="hasOssuary" className="cursor-pointer">
                          Possui Ossário
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <input
                          type="checkbox"
                          id="hasColumbarium"
                          checked={newCemetery.hasColumbarium}
                          onChange={(e) => setNewCemetery({ ...newCemetery, hasColumbarium: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="hasColumbarium" className="cursor-pointer">
                          Possui Columbário (para urnas)
                        </Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Responsável</Label>
                        <Input
                          value={newCemetery.responsibleName || ''}
                          onChange={(e) => setNewCemetery({ ...newCemetery, responsibleName: e.target.value || undefined })}
                          placeholder="Ex: João Silva"
                        />
                        {errors.responsibleName && (
                            <p className="text-red-500 text-sm mt-1">{errors.responsibleName[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone do Responsável</Label>
                        <Input
                          value={newCemetery.responsiblePhone || ''}
                          onChange={(e) => setNewCemetery({ ...newCemetery, responsiblePhone: e.target.value || undefined })}
                          placeholder="Ex: (48) 98888-7777"
                        />
                        {errors.responsiblePhone && (
                            <p className="text-red-500 text-sm mt-1">{errors.responsiblePhone[0]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email de Contato</Label>
                        <Input
                          type="email"
                          value={newCemetery.email || ''}
                          onChange={(e) => setNewCemetery({ ...newCemetery, email: e.target.value || undefined })}
                          placeholder="Ex: contato@cemiterio.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Horário de Funcionamento</Label>
                        <Input
                          value={newCemetery.openingHours || ''}
                          onChange={(e) => setNewCemetery({ ...newCemetery, openingHours: e.target.value || undefined })}
                          placeholder="Ex: 08:00 - 18:00"
                        />
                        {errors.openingHours && (
                            <p className="text-red-500 text-sm mt-1">{errors.openingHours[0]}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Observações Gerais</Label>
                      <Textarea
                        value={newCemetery.notes || ''}
                        onChange={(e) => setNewCemetery({ ...newCemetery, notes: e.target.value || undefined })}
                        rows={3}
                        placeholder="Informações adicionais sobre o cemitério..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAdd}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Cemitério
                  </Button>
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Cemitérios */}
          <div className="space-y-4">
            {cemeteries.map((cemetery) => (
              <Card key={cemetery.id} className={editingId === cemetery.id ? 'border-blue-500 border-2' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{cemetery.name}</CardTitle>
                      <CardDescription>{cemetery.location} - {cemetery.address}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {editingId === cemetery.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(cemetery)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(cemetery.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === cemetery.id ? (
                    <Tabs defaultValue="basic" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                        <TabsTrigger value="structure">Estrutura</TabsTrigger>
                        <TabsTrigger value="contact">Contato</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nome do Cemitério</Label>
                            <Input
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            {updateErrors.name && (
                              <p className="text-red-500 text-sm mt-1">{updateErrors.name[0]}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Localização/Bairro</Label>
                            <Input
                              value={editForm.location || ''}
                              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            />
                            {updateErrors.location && (
                                <p className="text-red-500 text-sm mt-1">{updateErrors.location[0]}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Endereço Completo</Label>
                          <Input
                            value={editForm.address || ''}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          />
                          {updateErrors.address && (
                              <p className="text-red-500 text-sm mt-1">{updateErrors.address[0]}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Tipo de Cemitério</Label>
                            <Select
                              value={editForm.cemeteryType}
                              onValueChange={(value: 'Municipal' | 'Particular' | 'Paroquial') =>
                                setEditForm({ ...editForm, cemeteryType: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Municipal">Municipal</SelectItem>
                                <SelectItem value="Particular">Particular</SelectItem>
                                <SelectItem value="Paroquial">Paroquial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Ano de Fundação</Label>
                            <Input
                              type="number"
                              value={editForm.yearEstablished || ''}
                              onChange={(e) => setEditForm({ ...editForm, yearEstablished: parseInt(e.target.value) || undefined })}
                            />
                             {updateErrors.yearEstablished && (
                                <p className="text-red-500 text-sm mt-1">{updateErrors.yearEstablished[0]}</p>
                             )}
                          </div>
                          <div className="space-y-2">
                            <Label>Área (m²)</Label>
                            <Input
                              type="number"
                              value={editForm.areaSize || ''}
                              onChange={(e) => setEditForm({ ...editForm, areaSize: parseInt(e.target.value) || undefined })}
                            />
                            {updateErrors.areaSize && (
                                <p className="text-red-500 text-sm mt-1">{updateErrors.areaSize[0]}</p>
                                             )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="structure" className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Total de Quadras</Label>
                            <Input
                              type="number"
                              value={editForm.totalQuadras || 0}
                              onChange={(e) => setEditForm({ ...editForm, totalQuadras: parseInt(e.target.value) || 0 })}
                            />
                            {updateErrors.totalQuadras && (
                                <p className="text-red-500 text-sm mt-1">{updateErrors.totalQuadras[0]}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Sepulturas por Quadra</Label>
                            <Input
                              type="number"
                              value={editForm.plotsPerQuadra || ''}
                              onChange={(e) => setEditForm({ ...editForm, plotsPerQuadra: parseInt(e.target.value) || undefined })}
                            />
                            {updateErrors.plotsPerQuadra && (
                                <p className="text-red-500 text-sm mt-1">{updateErrors.plotsPerQuadra[0]}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Total de Jazigos</Label>
                            <Input
                              type="number"
                              value={editForm.totalPlots || 0}
                              onChange={(e) => setEditForm({ ...editForm, totalPlots: parseInt(e.target.value) || 0 })}
                            />
                            {updateErrors.totalPlots && (
                                <p className="text-red-500 text-sm mt-1">{updateErrors.totalPlots[0]}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Jazigos Ocupados</Label>
                            <Input
                              type="number"
                              value={editForm.occupiedPlots || 0}
                              onChange={(e) => setEditForm({ ...editForm, occupiedPlots: parseInt(e.target.value) || 0 })}
                            />
                            {updateErrors.occupiedPlots && (
                                <p className="text-red-500 text-sm mt-1">{updateErrors.occupiedPlots[0]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2 p-4 border rounded-lg">
                            <input
                              type="checkbox"
                              id={`hasOssuary-${cemetery.id}`}
                              checked={editForm.hasOssuary || false}
                              onChange={(e) => setEditForm({ ...editForm, hasOssuary: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`hasOssuary-${cemetery.id}`} className="cursor-pointer">
                              Possui Ossário
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-4 border rounded-lg">
                            <input
                              type="checkbox"
                              id={`hasColumbarium-${cemetery.id}`}
                              checked={editForm.hasColumbarium || false}
                              onChange={(e) => setEditForm({ ...editForm, hasColumbarium: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`hasColumbarium-${cemetery.id}`} className="cursor-pointer">
                              Possui Columbário
                            </Label>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="contact" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nome do Responsável</Label>
                            <Input
                              value={editForm.responsibleName || ''}
                              onChange={(e) => setEditForm({ ...editForm, responsibleName: e.target.value || undefined })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Telefone do Responsável</Label>
                            <Input
                              value={editForm.responsiblePhone || ''}
                              onChange={(e) => setEditForm({ ...editForm, responsiblePhone: e.target.value || undefined })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email de Contato</Label>
                            <Input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value || undefined })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Horário de Funcionamento</Label>
                            <Input
                              value={editForm.openingHours || ''}
                              onChange={(e) => setEditForm({ ...editForm, openingHours: e.target.value || undefined })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Observações Gerais</Label>
                          <Textarea
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value || undefined })}
                            rows={3}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Tipo</p>
                        <Badge variant="outline">{cemetery.cemeteryType || 'N/A'}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Quadras</p>
                        <p className="text-lg font-semibold">{cemetery.totalQuadras}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Jazigos</p>
                        <p className="text-lg font-semibold">{cemetery.occupiedPlots} / {cemetery.totalPlots}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Ocupação</p>
                        <Badge
                          variant={
                            parseFloat(occupancyRate(cemetery)) > 80 ? 'destructive' :
                            parseFloat(occupancyRate(cemetery)) > 60 ? 'default' : 'secondary'
                          }
                        >
                          {occupancyRate(cemetery)}%
                        </Badge>
                      </div>
                      {cemetery.yearEstablished && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Fundação</p>
                          <p className="text-sm">{cemetery.yearEstablished}</p>
                        </div>
                      )}
                      {cemetery.areaSize && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Área</p>
                          <p className="text-sm">{cemetery.areaSize.toLocaleString()} m²</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Infraestrutura</p>
                        <div className="flex gap-2">
                          {cemetery.hasOssuary && <Badge variant="secondary" className="text-xs">Ossário</Badge>}
                          {cemetery.hasColumbarium && <Badge variant="secondary" className="text-xs">Columbário</Badge>}
                          {!cemetery.hasOssuary && !cemetery.hasColumbarium && <p className="text-sm text-gray-400">N/A</p>}
                        </div>
                      </div>
                      {cemetery.responsibleName && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Responsável</p>
                          <p className="text-sm">{cemetery.responsibleName}</p>
                          {cemetery.responsiblePhone && <p className="text-xs text-gray-500">{cemetery.responsiblePhone}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
