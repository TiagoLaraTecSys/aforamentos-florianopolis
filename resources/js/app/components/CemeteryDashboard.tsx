import { useState } from 'react';
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
import { differenceInDays, addYears, differenceInYears } from 'date-fns';
import { useAuth, Permissions } from '@/contexts/AuthContext';
import { useLogs } from '@/contexts/LogContext';

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

const initialCemeteries: Cemetery[] = [
  {
    id: 1,
    name: 'SÃO FRANCISCO DE ASSIS',
    location: 'Itacorubi',
    address: 'Rua Pastor William Richard Schisler Filho, nº 452, Itacorubi, Florianópolis – SC',
    totalPlots: 1500,
    occupiedPlots: 1200,
    totalQuadras: 15,
    plotsPerQuadra: 100,
    cemeteryType: 'Municipal',
    yearEstablished: 1950,
    areaSize: 50000,
    hasOssuary: true,
    hasColumbarium: false,
    responsibleName: 'João Silva',
    responsiblePhone: '(11) 98888-7777',
    email: 'joao.silva@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério municipal com área de 50.000 m²'
  },
  {
    id: 2,
    name: 'SÃO CRISTÓVÃO',
    location: 'Capoeiras',
    address: 'Rua São Cristóvão, Capoeiras, Florianópolis – SC',
    totalPlots: 1200,
    occupiedPlots: 890,
    totalQuadras: 12,
    plotsPerQuadra: 100,
    cemeteryType: 'Particular',
    yearEstablished: 1980,
    areaSize: 40000,
    hasOssuary: false,
    hasColumbarium: true,
    responsibleName: 'Maria Oliveira',
    responsiblePhone: '(11) 97777-6666',
    email: 'maria.oliveira@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério particular com área de 40.000 m²'
  },
  {
    id: 3,
    name: 'BARRA DA LAGOA',
    location: 'Fortaleza da Barra da Lagoa',
    address: 'Rua Laurindo José de Souza, Fortaleza da Barra da Lagoa, Florianópolis – SC',
    totalPlots: 800,
    occupiedPlots: 650,
    totalQuadras: 8,
    plotsPerQuadra: 100,
    cemeteryType: 'Paroquial',
    yearEstablished: 1970,
    areaSize: 30000,
    hasOssuary: true,
    hasColumbarium: false,
    responsibleName: 'Carlos Oliveira',
    responsiblePhone: '(11) 98765-4321',
    email: 'carlos.oliveira@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério paroquial com área de 30.000 m²'
  },
  {
    id: 4,
    name: 'CAMPECHE',
    location: 'Campeche',
    address: 'Rua da Capela, Campeche, Florianópolis',
    totalPlots: 950,
    occupiedPlots: 720,
    totalQuadras: 9,
    plotsPerQuadra: 100,
    cemeteryType: 'Municipal',
    yearEstablished: 1960,
    areaSize: 45000,
    hasOssuary: false,
    hasColumbarium: true,
    responsibleName: 'Fernanda Fernandes',
    responsiblePhone: '(11) 98888-7777',
    email: 'fernanda.fernandes@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério municipal com área de 45.000 m²'
  },
  {
    id: 5,
    name: 'CANASVIEIRAS',
    location: 'Canasvieiras',
    address: 'Rodovia Teruliano Brito Xavier (atrás da Igreja de Santo Antônio de Paula), Canasvieiras, Florianópolis – SC',
    totalPlots: 1100,
    occupiedPlots: 850,
    totalQuadras: 11,
    plotsPerQuadra: 100,
    cemeteryType: 'Particular',
    yearEstablished: 1990,
    areaSize: 55000,
    hasOssuary: true,
    hasColumbarium: false,
    responsibleName: 'Ana Paula Rodrigues',
    responsiblePhone: '1122334455',
    email: 'ana.paula@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério particular com área de 55.000 m²'
  },
  {
    id: 6,
    name: 'INGLESES/SANTINHO',
    location: 'Ingleses (Santinho)',
    address: 'Estrada Vereador Onildo Lemos, Ingleses (Santinho), Florianópolis – SC',
    totalPlots: 1050,
    occupiedPlots: 780,
    totalQuadras: 10,
    plotsPerQuadra: 100,
    cemeteryType: 'Paroquial',
    yearEstablished: 1940,
    areaSize: 40000,
    hasOssuary: false,
    hasColumbarium: true,
    responsibleName: 'Roberto Carlos Lima',
    responsiblePhone: '5544332211',
    email: 'roberto.lima@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério paroquial com área de 40.000 m²'
  },
  {
    id: 7,
    name: 'LAGOA DA CONCEIÇÃO',
    location: 'Lagoa da Conceição',
    address: 'Rua Manoel Severino de Oliveira, Lagoa da Conceição, Florianópolis – SC',
    totalPlots: 1300,
    occupiedPlots: 1050,
    totalQuadras: 13,
    plotsPerQuadra: 100,
    cemeteryType: 'Municipal',
    yearEstablished: 1930,
    areaSize: 60000,
    hasOssuary: true,
    hasColumbarium: false,
    responsibleName: 'Fernanda Souza Almeida',
    responsiblePhone: '9988776655',
    email: 'fernanda.souza@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério municipal com área de 60.000 m²'
  },
  {
    id: 8,
    name: 'PÂNTANO DO SUL',
    location: 'Pântano do Sul',
    address: 'Rua Sinfronio Manoel de Souza, Pântano do Sul, Florianópolis – SC',
    totalPlots: 700,
    occupiedPlots: 520,
    totalQuadras: 7,
    plotsPerQuadra: 100,
    cemeteryType: 'Particular',
    yearEstablished: 1920,
    areaSize: 35000,
    hasOssuary: false,
    hasColumbarium: true,
    responsibleName: 'Pedro Santos',
    responsiblePhone: '1122334455',
    email: 'pedro.santos@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério particular com área de 35.000 m²'
  },
  {
    id: 9,
    name: 'RATONES',
    location: 'Ratones',
    address: 'Estrada Intendente Antônio Damasco, Ratones, Florianópolis – SC',
    totalPlots: 900,
    occupiedPlots: 680,
    totalQuadras: 9,
    plotsPerQuadra: 100,
    cemeteryType: 'Paroquial',
    yearEstablished: 1910,
    areaSize: 45000,
    hasOssuary: true,
    hasColumbarium: false,
    responsibleName: 'Ana Maria',
    responsiblePhone: '5544332211',
    email: 'ana.maria@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério paroquial com área de 45.000 m²'
  },
  {
    id: 10,
    name: 'RIBEIRÃO DA ILHA',
    location: 'Ribeirão da Ilha',
    address: 'Rua Alberto Cavalheiro (atrás da igreja), Ribeirão da Ilha, Florianópolis – SC',
    totalPlots: 1150,
    occupiedPlots: 890,
    totalQuadras: 11,
    plotsPerQuadra: 100,
    cemeteryType: 'Municipal',
    yearEstablished: 1900,
    areaSize: 55000,
    hasOssuary: false,
    hasColumbarium: true,
    responsibleName: 'João Pereira',
    responsiblePhone: '1122334455',
    email: 'joao.pereira@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério municipal com área de 55.000 m²'
  },
  {
    id: 11,
    name: 'RIO VERMELHO',
    location: 'São João do Rio Vermelho',
    address: 'Rodovia João Gualberto Soares, São João do Rio Vermelho, Florianópolis – SC',
    totalPlots: 850,
    occupiedPlots: 640,
    totalQuadras: 8,
    plotsPerQuadra: 100,
    cemeteryType: 'Particular',
    yearEstablished: 1890,
    areaSize: 40000,
    hasOssuary: true,
    hasColumbarium: false,
    responsibleName: 'Maria Silva',
    responsiblePhone: '(11) 98888-7777',
    email: 'maria.silva@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério particular com área de 40.000 m²'
  },
  {
    id: 12,
    name: 'SANTO ANTÔNIO DE LISBOA',
    location: 'Santo Antônio de Lisboa',
    address: 'Estrada Caminho dos Açores, nº 2450, Santo Antônio de Lisboa, Florianópolis – SC',
    totalPlots: 1200,
    occupiedPlots: 920,
    totalQuadras: 12,
    plotsPerQuadra: 100,
    cemeteryType: 'Paroquial',
    yearEstablished: 1880,
    areaSize: 50000,
    hasOssuary: false,
    hasColumbarium: true,
    responsibleName: 'Carlos Oliveira',
    responsiblePhone: '(11) 97777-6666',
    email: 'carlos.oliveira@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério paroquial com área de 50.000 m²'
  },
  {
    id: 13,
    name: 'ARMAÇÃO',
    location: 'Armação',
    address: 'Avenida Antônio Borges dos Santos (atrás da igreja), Armação, Florianópolis – SC',
    totalPlots: 1000,
    occupiedPlots: 750,
    totalQuadras: 10,
    plotsPerQuadra: 100,
    cemeteryType: 'Municipal',
    yearEstablished: 1870,
    areaSize: 45000,
    hasOssuary: true,
    hasColumbarium: false,
    responsibleName: 'Fernanda Fernandes',
    responsiblePhone: '(11) 98765-4321',
    email: 'fernanda.fernandes@cemiterio.com',
    openingHours: '08:00 - 18:00',
    notes: 'Cemitério municipal com área de 45.000 m²'
  },
];

const mockBurials: Burial[] = [
  {
    id: 1,
    cemeteryId: 1,
    galsc: 'GALSC-2024-0001',
    burialNumber: '0001',
    deceasedName: 'João Silva Santos',
    dateOfBirth: '1945-03-15',
    dateOfDeath: '2024-12-10',
    burialDate: '2024-12-12',
    quadra: 'A',
    plotNumber: '123',
    sector: 'Setor A',
    burialType: 'INUMAÇÃO',
    currentStatus: 'Sepultado',
    responsibleName: 'Maria Silva',
    responsiblePhone: '(11) 98888-7777',
    notes: 'Sepultamento realizado conforme solicitação da família'
  },
  {
    id: 2,
    cemeteryId: 2,
    burialNumber: '0045',
    deceasedName: 'Maria Oliveira Costa',
    dateOfBirth: '1952-08-22',
    dateOfDeath: '2024-11-25',
    burialDate: '2024-11-27',
    quadra: 'B',
    plotNumber: '045',
    sector: 'Setor B',
    burialType: 'TUMULAÇÃO(GAVETA)',
    currentStatus: 'Sepultado',
    responsibleName: 'Carlos Oliveira',
    responsiblePhone: '(11) 97777-6666',
    notes: 'Jazigo familiar - 6 gavetas'
  },
  {
    id: 3,
    cemeteryId: 1,
    galsc: 'GALSC-2025-0001',
    burialNumber: '0002',
    deceasedName: 'Carlos Alberto Fernandes',
    dateOfBirth: '1938-11-05',
    dateOfDeath: '2025-01-05',
    burialDate: '2025-01-07',
    quadra: 'C',
    plotNumber: '234',
    sector: 'Setor C',
    burialType: 'INUMAÇÃO',
    currentStatus: 'Sepultado',
    responsibleName: 'Fernanda Fernandes',
    responsiblePhone: '(11) 98765-4321'
  }
];

const mockLeases: Lease[] = [
  {
    id: 1,
    cemeteryId: 1,
    leaseholderName: 'Ana Paula Rodrigues',
    quadra: 'A',
    plotNumber: 'A-456',
    sector: 'Setor A',
    leaseType: 'Perpétuo',
    startDate: '2020-05-10',
    status: 'Ativo',
    amount: 5000,
    responsibleName: 'João Pereira',
    responsiblePhone: '1122334455',
    notes: 'Aforamento perpétuo - documentação completa'
  },
  {
    id: 2,
    cemeteryId: 3,
    leaseholderName: 'Roberto Carlos Lima',
    quadra: 'D',
    plotNumber: 'D-089',
    sector: 'Setor D',
    leaseType: 'Temporário',
    startDate: '2023-03-15',
    expiryDate: '2028-03-15',
    status: 'Ativo',
    amount: 1500,
    responsibleName: 'Ana Maria',
    responsiblePhone: '5544332211',
    notes: 'Aforamento temporário - 5 anos'
  },
  {
    id: 3,
    cemeteryId: 2,
    leaseholderName: 'Fernanda Souza Almeida',
    quadra: 'E',
    plotNumber: 'E-122',
    sector: 'Setor E',
    leaseType: 'Perpétuo',
    startDate: '2015-09-20',
    status: 'Ativo',
    amount: 4500,
    responsibleName: 'Pedro Santos',
    responsiblePhone: '9988776655'
  }
];

export function CemeteryDashboard() {
  const [selectedCemetery, setSelectedCemetery] = useState<number | 'all'>('all');
  const [cemeteries, setCemeteries] = useState<Cemetery[]>(initialCemeteries);
  const [burials, setBurials] = useState<Burial[]>(mockBurials);
  const [leases, setLeases] = useState<Lease[]>(mockLeases);
  const [showAddBurial, setShowAddBurial] = useState(false);
  const [showAddLease, setShowAddLease] = useState(false);
  const [showEditBurial, setShowEditBurial] = useState<Burial | null>(null);
  const [showEditLease, setShowEditLease] = useState<Lease | null>(null);
  const [showCemeteryManagement, setShowCemeteryManagement] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { user, logout, hasPermission } = useAuth();
  const { logs } = useLogs();

  const filteredBurials = selectedCemetery === 'all'
    ? burials
    : burials.filter(b => b.cemeteryId === selectedCemetery);

  const filteredLeases = selectedCemetery === 'all'
    ? leases
    : leases.filter(l => l.cemeteryId === selectedCemetery);

  const selectedCemeteryData = selectedCemetery !== 'all'
    ? cemeteries.find(c => c.id === selectedCemetery)
    : null;

  const totalBurials = selectedCemetery === 'all'
    ? burials.length
    : burials.filter(b => b.cemeteryId === selectedCemetery).length;

  const totalLeases = selectedCemetery === 'all'
    ? leases.length
    : leases.filter(l => l.cemeteryId === selectedCemetery).length;

  const totalOccupiedPlots = selectedCemetery === 'all'
    ? cemeteries.reduce((sum, c) => sum + c.occupiedPlots, 0)
    : selectedCemeteryData?.occupiedPlots || 0;

  const totalPlots = selectedCemetery === 'all'
    ? cemeteries.reduce((sum, c) => sum + c.totalPlots, 0)
    : selectedCemeteryData?.totalPlots || 0;

  const occupancyRate = totalPlots > 0 ? ((totalOccupiedPlots / totalPlots) * 100).toFixed(1) : '0';

  // Calcular notificações pendentes
  const calculatePendingNotifications = () => {
    let count = 0;
    const today = new Date();

    // Verificar sepultamentos
    burials.forEach(burial => {
      const burialDate = new Date(burial.burialDate);
      const yearsElapsed = differenceInYears(today, burialDate);
      const nextRegularizationYears = Math.ceil(yearsElapsed / 5) * 5;
      const nextRegularization = addYears(burialDate, nextRegularizationYears);
      const daysUntilNext = differenceInDays(nextRegularization, today);

      if (daysUntilNext <= 90 && daysUntilNext >= -30) {
        count++;
      }
    });

    // Verificar aforamentos
    leases.forEach(lease => {
      if (lease.leaseType === 'Temporário' && lease.expiryDate) {
        const expiryDate = new Date(lease.expiryDate);
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        if (daysUntilExpiry <= 90) {
          count++;
        }
      } else if (lease.leaseType === 'Perpétuo') {
        const startDate = new Date(lease.startDate);
        const yearsElapsed = differenceInYears(today, startDate);
        const nextRegularizationYears = Math.ceil(yearsElapsed / 5) * 5;
        const nextRegularization = addYears(startDate, nextRegularizationYears);
        const daysUntilNext = differenceInDays(nextRegularization, today);

        if (daysUntilNext <= 90 && daysUntilNext >= -30) {
          count++;
        }
      }
    });

    return count;
  };

  const pendingNotifications = calculatePendingNotifications();

  const handleAddBurial = (burial: Omit<Burial, 'id'>) => {
    const newBurial: Burial = {
      ...burial,
      id: Math.max(...burials.map(b => b.id), 0) + 1
    };
    setBurials([...burials, newBurial]);
    setShowAddBurial(false);
  };

  const handleAddLease = (lease: Omit<Lease, 'id'>) => {
    const newLease: Lease = {
      ...lease,
      id: Math.max(...leases.map(l => l.id), 0) + 1
    };
    setLeases([...leases, newLease]);
    setShowAddLease(false);
  };

  const handleDeleteBurial = (id: number) => {
    setBurials(burials.filter(b => b.id !== id));
  };

  const handleDeleteLease = (id: number) => {
    setLeases(leases.filter(l => l.id !== id));
  };

  const handleEditBurial = (burial: Burial) => {
    setBurials(burials.map(b => (b.id === burial.id ? burial : b)));
    setShowEditBurial(null);
  };

  const handleEditLease = (lease: Lease) => {
    setLeases(leases.map(l => (l.id === lease.id ? lease : l)));
    setShowEditLease(null);
  };

  const handleImportBurials = (newBurials: Omit<Burial, 'id'>[]) => {
    const maxId = Math.max(...burials.map(b => b.id), 0);
    const burialsWithIds = newBurials.map((burial, index) => ({
      ...burial,
      id: maxId + index + 1
    }));
    setBurials([...burials, ...burialsWithIds]);
  };

  const handleImportLeases = (newLeases: Omit<Lease, 'id'>[]) => {
    const maxId = Math.max(...leases.map(l => l.id), 0);
    const leasesWithIds = newLeases.map((lease, index) => ({
      ...lease,
      id: maxId + index + 1
    }));
    setLeases([...leases, ...leasesWithIds]);
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
                onClick={() => setSelectedCemetery('all')}
                className="justify-start"
              >
                Todos os Cemitérios
              </Button>
              {cemeteries.map((cemetery) => (
                <Button
                  key={cemetery.id}
                  variant={selectedCemetery === cemetery.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCemetery(cemetery.id)}
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
              <div className="text-2xl font-bold">{totalBurials}</div>
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
              <div className="text-2xl font-bold">{totalLeases}</div>
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
              {pendingNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                >
                  {pendingNotifications}
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
                    burials={filteredBurials}
                    cemeteries={cemeteries}
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
                    leases={filteredLeases}
                    cemeteries={cemeteries}
                    onDelete={handleDeleteLease}
                    onEdit={setShowEditLease}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationsTab
              burials={filteredBurials}
              leases={filteredLeases}
              cemeteries={cemeteries}
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
              {user?.role}
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
