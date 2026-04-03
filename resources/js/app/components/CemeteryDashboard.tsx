import { useState, useEffect } from 'react';
import { Building2, Users, FileText, TrendingUp, Bell, LogOut, Settings, Activity, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { BurialList } from './BurialList';
import { LeaseList } from './LeaseList';
import { AddBurialForm } from './AddBurialForm';
import { AddLeaseForm } from './AddLeaseForm';
import { EditBurialForm } from './EditBurialForm';
import { EditLeaseForm } from './EditLeaseForm';
import { NotificationsTab } from './NotificationsTab';
import { CemeteryManagement } from './CemeteryManagement';
import { SystemLogs } from '@/app/components/SystemLogs';
import { ImportData } from '@/app/components/ImportData';
import { useAuth, Permissions } from '@/contexts/AuthContext';
import { useLogs } from '@/contexts/LogContext';
import { getCemiterios } from '@/services/CemiterioService';
import { getBurials, createBurial, updateBurial, deleteBurial } from '@/services/BurialService';
import { getLeases, createLease, updateLease, deleteLease } from '@/services/LeaseService';
import { apiBurialToFe, feBurialToApi, apiLeaseToFe, feLeaseToApi } from '@/utils/mappers';
import { getRegularizationsCount } from '@/services/RegularizationService';


export interface Cemetery {
  id: number;
  name: string;
  location: string;
  address: string; // Endereço completo
  totalPlots: number;
  occupiedPlots: number;
  totalQuadras: number; // Total de quadras
  plotsPerQuadra?: number; // Sepulturas por quadra (média)
  cemeteryType?: 'Municipal' | 'Particular' | 'Paroquial'; // Tipo de cemitério
  yearEstablished?: number; // Ano de fundação
  areaSize?: number; // Área em m²
  hasOssuary?: boolean; // Possui ossário
  hasColumbarium?: boolean; // Possui columbário (para urnas)
  responsibleName?: string; // Responsável pelo cemitério
  responsiblePhone?: string; // Telefone do responsável
  email?: string; // Email de contato
  openingHours?: string; // Horário de funcionamento
  notes?: string; // Observações gerais
}

export interface Burial {
  id: number;
  cemeteryId: number;
  galsc?: string; // Número único de cadastramento (opcional, sistema novo)
  burialNumber?: string; // Número de sepultamento específico do cemitério (opcional se tiver GALSC)
  deceasedName: string;
  dateOfBirth: string;
  dateOfDeath: string;
  burialDate: string;
  quadra: string; // Quadra onde está localizado
  plotNumber: string; // Número da sepultura
  sector: string;
  burialType: 'INUMAÇÃO' | 'TUMULAÇÃO(GAVETA)' | 'EXUMAÇÃO' | 'TRANSLADAÇÃO' | 'CREMAÇÃO' | 'REINUMAÇÃO' | 'OSSÁRIO';
  currentStatus: 'Sepultado' | 'Exumado' | 'Transladado' | 'Cremado'; // Estado atual
  responsibleName: string;
  responsiblePhone: string;
  notes?: string;
  regularizationPeriodYears?: number; // Período em anos para regularização (padrão: 5 anos)
  nextRegularizationDate?: string; // Data da próxima regularização (calculada ou manual)
  lastRegularizationDate?: string; // Data da última regularização
}

export interface Lease {
  id: number;
  cemeteryId: number;
  leaseholderName: string;
  quadra: string; // Quadra onde está localizado
  plotNumber: string;
  sector: string;
  leaseType: 'Perpétuo' | 'Temporário';
  startDate: string;
  expiryDate?: string;
  status: 'Ativo' | 'Vencido' | 'Renovado';
  amount: number;
  responsibleName: string;
  responsiblePhone: string;
  notes?: string;
  regularizationPeriodYears?: number; // Período em anos para regularização (padrão: 5 anos para perpétuos)
  nextRegularizationDate?: string; // Data da próxima regularização
  lastRegularizationDate?: string; // Data da última regularização
}



const PER_PAGE = 15;

export function CemeteryDashboard() {
  const [selectedCemetery, setSelectedCemetery] = useState<number | 'all'>('all');
  const [cemeteries, setCemeteries] = useState<Cemetery[]>([]);

  // Burials pagination
  const [burials, setBurials] = useState<Burial[]>([]);
  const [burialPage, setBurialPage] = useState(1);
  const [burialMeta, setBurialMeta] = useState({ total: 0, last_page: 1 });
  const [burialLoading, setBurialLoading] = useState(false);
  const [burialRefresh, setBurialRefresh] = useState(0);

  // Leases pagination
  const [leases, setLeases] = useState<Lease[]>([]);
  const [leasePage, setLeasePage] = useState(1);
  const [leaseMeta, setLeaseMeta] = useState({ total: 0, last_page: 1 });
  const [leaseLoading, setLeaseLoading] = useState(false);
  const [leaseRefresh, setLeaseRefresh] = useState(0);

  const [showAddBurial, setShowAddBurial] = useState(false);
  const [showAddLease, setShowAddLease] = useState(false);
  const [showEditBurial, setShowEditBurial] = useState<Burial | null>(null);
  const [showEditLease, setShowEditLease] = useState<Lease | null>(null);
  const [showCemeteryManagement, setShowCemeteryManagement] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [regularizationCount, setRegularizationCount] = useState(0);

  const { user, logout, hasPermission } = useAuth();
  const { logs } = useLogs();

  const selectedCemeteryData = selectedCemetery !== 'all'
    ? cemeteries.find(c => c.id === selectedCemetery)
    : null;

  const totalOccupiedPlots = selectedCemetery === 'all'
    ? cemeteries.reduce((sum, c) => sum + c.occupiedPlots, 0)
    : selectedCemeteryData?.occupiedPlots || 0;

  const totalPlots = selectedCemetery === 'all'
    ? cemeteries.reduce((sum, c) => sum + c.totalPlots, 0)
    : selectedCemeteryData?.totalPlots || 0;

  const occupancyRate = totalPlots > 0 ? ((totalOccupiedPlots / totalPlots) * 100).toFixed(1) : '0';

  // Fetch cemeteries once
  useEffect(() => {
    getCemiterios()
      .then(setCemeteries)
      .catch(err => console.error('Erro ao buscar cemitérios:', err));
  }, []);

  // Re-fetch burials when cemetery filter, page, or refresh counter changes
  useEffect(() => {
    setBurialLoading(true);
    getBurials({
      cemetery_id: selectedCemetery === 'all' ? undefined : selectedCemetery,
      page: burialPage,
      per_page: PER_PAGE,
    })
      .then(res => {
        setBurials(res.data.map(apiBurialToFe));
        setBurialMeta({ total: res.total, last_page: res.last_page });
      })
      .catch(err => console.error('Erro ao buscar sepultamentos:', err))
      .finally(() => setBurialLoading(false));
  }, [selectedCemetery, burialPage, burialRefresh]);

  // Re-fetch leases when cemetery filter, page, or refresh counter changes
  useEffect(() => {
    setLeaseLoading(true);
    getLeases({
      cemetery_id: selectedCemetery === 'all' ? undefined : selectedCemetery,
      page: leasePage,
      per_page: PER_PAGE,
    })
      .then(res => {
        setLeases(res.data.map(apiLeaseToFe));
        setLeaseMeta({ total: res.total, last_page: res.last_page });
      })
      .catch(err => console.error('Erro ao buscar aforamentos:', err))
      .finally(() => setLeaseLoading(false));
  }, [selectedCemetery, leasePage, leaseRefresh]);

  // Re-fetch regularization count when cemetery filter or refresh counters change
  useEffect(() => {
    const cemeteryId = selectedCemetery !== 'all' ? selectedCemetery : undefined;
    getRegularizationsCount(cemeteryId)
      .then(setRegularizationCount)
      .catch(err => console.error('Erro ao buscar contagem de regularizações:', err));
  }, [selectedCemetery, burialRefresh, leaseRefresh]);

  // Reset pages when cemetery filter changes
  const handleCemeteryChange = (value: number | 'all') => {
    setSelectedCemetery(value);
    setBurialPage(1);
    setLeasePage(1);
  };



  const handleAddBurial = async (burial: Omit<Burial, 'id'>) => {
    const result = await createBurial(feBurialToApi(burial));
    if ('status' in result && result.status === 'pendente') {
      alert(result.message);
    } else {
      setBurialRefresh(n => n + 1);
    }
    setShowAddBurial(false);
  };

  const handleAddLease = async (lease: Omit<Lease, 'id'>) => {
    const result = await createLease(feLeaseToApi(lease));
    if ('status' in result && result.status === 'pendente') {
      alert(result.message);
    } else {
      setLeaseRefresh(n => n + 1);
    }
    setShowAddLease(false);
  };

  const handleDeleteBurial = async (id: number) => {
    try {
      const result = await deleteBurial(id);
      if (result && 'status' in result && result.status === 'pendente') {
        alert(result.message);
      } else {
        setBurialRefresh(n => n + 1);
      }
    } catch (error) {
      console.error('Erro ao excluir sepultamento:', error);
    }
  };

  const handleDeleteLease = async (id: number) => {
    try {
      const result = await deleteLease(id);
      if (result && 'status' in result && result.status === 'pendente') {
        alert(result.message);
      } else {
        setLeaseRefresh(n => n + 1);
      }
    } catch (error) {
      console.error('Erro ao excluir aforamento:', error);
    }
  };

  const handleEditBurial = async (burial: Burial) => {
    const { id, ...rest } = burial;
    const result = await updateBurial(id, feBurialToApi(rest));
    if ('status' in result && result.status === 'pendente') {
      alert(result.message);
    } else {
      setBurialRefresh(n => n + 1);
    }
    setShowEditBurial(null);
  };

  const handleEditLease = async (lease: Lease) => {
    const { id, ...rest } = lease;
    const result = await updateLease(id, feLeaseToApi(rest));
    if ('status' in result && result.status === 'pendente') {
      alert(result.message);
    } else {
      setLeaseRefresh(n => n + 1);
    }
    setShowEditLease(null);
  };

  const handleImportBurials = async (newBurials: Omit<Burial, 'id'>[]) => {
    try {
      await Promise.all(newBurials.map(b => createBurial(feBurialToApi(b))));
      setBurialPage(1);
      setBurialRefresh(n => n + 1);
    } catch (error) {
      console.error('Erro ao importar sepultamentos:', error);
    }
  };

  const handleImportLeases = async (newLeases: Omit<Lease, 'id'>[]) => {
    try {
      await Promise.all(newLeases.map(l => createLease(feLeaseToApi(l))));
      setLeasePage(1);
      setLeaseRefresh(n => n + 1);
    } catch (error) {
      console.error('Erro ao importar aforamentos:', error);
    }
  };

  // Renderizar tela de importação se estiver ativa
  if (showImport) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <ImportData
            cemeteries={cemeteries}
            onImportBurials={handleImportBurials}
            onImportLeases={handleImportLeases}
            onClose={() => setShowImport(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Gerenciamento de Cemitérios</h1>
            <p className="text-gray-600 mt-1">Gestão completa de sepultamentos e aforamentos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Planilha
            </Button>
            <Badge variant="outline" className="text-sm">
              {cemeteries.length} Cemitérios
            </Badge>
          </div>
        </div>

        {/* Cemetery Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Selecionar Cemitério
            </CardTitle>
            <CardDescription>Escolha um cemitério específico ou visualize todos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              <Button
                variant={selectedCemetery === 'all' ? 'default' : 'outline'}
                onClick={() => handleCemeteryChange('all')}
                className="justify-start"
              >
                Todos os Cemitérios
              </Button>
              {cemeteries.map((cemetery) => (
                <Button
                  key={cemetery.id}
                  variant={selectedCemetery === cemetery.id ? 'default' : 'outline'}
                  onClick={() => handleCemeteryChange(cemetery.id)}
                  className="justify-start"
                >
                  {cemetery.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Jazigos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlots}</div>
              <p className="text-xs text-muted-foreground">
                {selectedCemetery === 'all' ? 'Todos os cemitérios' : selectedCemeteryData?.location}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jazigos Ocupados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOccupiedPlots}</div>
              <p className="text-xs text-muted-foreground">
                Taxa de ocupação: {occupancyRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sepultamentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{burialMeta.total}</div>
              <p className="text-xs text-muted-foreground">
                Registros cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aforamentos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaseMeta.total}</div>
              <p className="text-xs text-muted-foreground">
                Contratos ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="burials" className="space-y-4">
          <TabsList className={`grid w-full ${true ? 'grid-cols-5' : 'grid-cols-3'} max-w-4xl`}>
            <TabsTrigger value="burials">Sepultamentos</TabsTrigger>
            <TabsTrigger value="leases">Aforamentos</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notificações
              {regularizationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                >
                  {regularizationCount}
                </Badge>
              )}
            </TabsTrigger>
            {true && (
              <>
                <TabsTrigger value="cemeteries">
                  Cemitérios
                </TabsTrigger>
                <TabsTrigger value="logs" className="relative">
                  Logs
                  <Badge
                    variant="outline"
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                  >
                    {logs.length}
                  </Badge>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="burials" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registro de Sepultamentos</CardTitle>
                    <CardDescription>
                      Listagem de todos os sepultamentos cadastrados
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddBurial(true)}>
                    Adicionar Sepultamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddBurial ? (
                  <AddBurialForm
                    cemeteries={cemeteries}
                    onAdd={handleAddBurial}
                    onCancel={() => setShowAddBurial(false)}
                  />
                ) : showEditBurial ? (
                  <EditBurialForm
                    cemeteries={cemeteries}
                    burial={showEditBurial}
                    onEdit={handleEditBurial}
                    onCancel={() => setShowEditBurial(null)}
                  />
                ) : (
                  <BurialList
                    burials={burials}
                    cemeteries={cemeteries}
                    loading={burialLoading}
                    currentPage={burialPage}
                    lastPage={burialMeta.last_page}
                    total={burialMeta.total}
                    onPageChange={setBurialPage}
                    onDelete={handleDeleteBurial}
                    onEdit={setShowEditBurial}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leases" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registro de Aforamentos</CardTitle>
                    <CardDescription>
                      Listagem de todos os aforamentos cadastrados
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddLease(true)}>
                    Adicionar Aforamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddLease ? (
                  <AddLeaseForm
                    cemeteries={cemeteries}
                    onAdd={handleAddLease}
                    onCancel={() => setShowAddLease(false)}
                  />
                ) : showEditLease ? (
                  <EditLeaseForm
                    cemeteries={cemeteries}
                    lease={showEditLease}
                    onEdit={handleEditLease}
                    onCancel={() => setShowEditLease(null)}
                  />
                ) : (
                  <LeaseList
                    leases={leases}
                    cemeteries={cemeteries}
                    loading={leaseLoading}
                    currentPage={leasePage}
                    lastPage={leaseMeta.last_page}
                    total={leaseMeta.total}
                    onPageChange={setLeasePage}
                    onDelete={handleDeleteLease}
                    onEdit={setShowEditLease}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationsTab
              selectedCemetery={selectedCemetery}
              refresh={burialRefresh + leaseRefresh}
              onRegularized={() => {
                setBurialRefresh(n => n + 1);
                setLeaseRefresh(n => n + 1);
              }}
            />
          </TabsContent>

          <TabsContent value="cemeteries" className="space-y-4">
            <CemeteryManagement
              cemeteries={cemeteries}
              onUpdate={setCemeteries}
            />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <SystemLogs />
          </TabsContent>
        </Tabs>

        {/* User Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {user?.name}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {user?.roles?.[0]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => logout()}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedCemetery('all')}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Gerenciar Cemitérios
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCemeteryManagement(true)}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Logs do Sistema
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
