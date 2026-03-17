import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import Papa from 'papaparse';
import type { Cemetery, Burial, Lease } from './CemeteryDashboard';

interface ImportDataProps {
  cemeteries: Cemetery[];
  onImportBurials: (burials: Omit<Burial, 'id'>[]) => void;
  onImportLeases: (leases: Omit<Lease, 'id'>[]) => void;
  onClose: () => void;
}

interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string; data?: any }>;
  warnings: Array<{ row: number; warning: string; data?: any }>;
}

export function ImportData({ cemeteries, onImportBurials, onImportLeases, onClose }: ImportDataProps) {
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState<'burials' | 'leases'>('burials');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Template de planilha para sepultamentos
  const burialTemplate = [
    'nome_cemiterio',
    'galsc',
    'numero_sepultamento',
    'nome_falecido',
    'data_nascimento',
    'data_falecimento',
    'data_sepultamento',
    'quadra',
    'numero_jazigo',
    'setor',
    'tipo_sepultamento',
    'status_atual',
    'nome_responsavel',
    'telefone_responsavel',
    'observacoes',
    'periodo_regularizacao_anos',
    'proxima_regularizacao',
    'ultima_regularizacao'
  ];

  // Template de planilha para aforamentos
  const leaseTemplate = [
    'nome_cemiterio',
    'nome_titular',
    'quadra',
    'numero_jazigo',
    'setor',
    'tipo_aforamento',
    'data_inicio',
    'data_vencimento',
    'status',
    'valor',
    'nome_responsavel',
    'telefone_responsavel',
    'observacoes',
    'periodo_regularizacao_anos',
    'proxima_regularizacao',
    'ultima_regularizacao'
  ];

  const downloadTemplate = (type: 'burials' | 'leases') => {
    const template = type === 'burials' ? burialTemplate : leaseTemplate;
    
    // Criar exemplos
    const examples = type === 'burials' ? [
      [
        'SÃO FRANCISCO DE ASSIS',
        'GALSC-2024-0001',
        '0001',
        'João Silva Santos',
        '1945-03-15',
        '2024-12-10',
        '2024-12-12',
        'A',
        '123',
        'Setor A',
        'INUMAÇÃO',
        'Sepultado',
        'Maria Silva',
        '(11) 98888-7777',
        'Sepultamento realizado conforme solicitação da família',
        '5',
        '2029-12-12',
        '2024-12-12'
      ],
      [
        'SÃO CRISTÓVÃO',
        '',
        '0045',
        'Maria Oliveira Costa',
        '1952-08-22',
        '2024-11-25',
        '2024-11-27',
        'B',
        '045',
        'Setor B',
        'TUMULAÇÃO(GAVETA)',
        'Sepultado',
        'Carlos Oliveira',
        '(11) 97777-6666',
        'Jazigo familiar - 6 gavetas',
        '10',
        '',
        ''
      ]
    ] : [
      [
        'SÃO FRANCISCO DE ASSIS',
        'Ana Paula Rodrigues',
        'A',
        'A-456',
        'Setor A',
        'Perpétuo',
        '2020-05-10',
        '',
        'Ativo',
        '5000',
        'João Pereira',
        '1122334455',
        'Aforamento perpétuo - documentação completa',
        '5',
        '2025-05-10',
        '2020-05-10'
      ],
      [
        'BARRA DA LAGOA',
        'Roberto Carlos Lima',
        'D',
        'D-089',
        'Setor D',
        'Temporário',
        '2023-03-15',
        '2028-03-15',
        'Ativo',
        '1500',
        'Ana Maria',
        '5544332211',
        'Aforamento temporário - 5 anos',
        '',
        '',
        ''
      ]
    ];

    const csvContent = [template, ...examples]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${type === 'burials' ? 'sepultamentos' : 'aforamentos'}.csv`;
    link.click();
  };

  const findCemeteryByName = (name: string): Cemetery | undefined => {
    return cemeteries.find(c => 
      c.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  const parseBurialRow = (row: any, rowIndex: number): { burial?: Omit<Burial, 'id'>; error?: string; warning?: string } => {
    const cemeteryName = row.nome_cemiterio?.trim();
    const cemetery = findCemeteryByName(cemeteryName);

    if (!cemeteryName) {
      return { error: 'Nome do cemitério é obrigatório' };
    }

    if (!cemetery) {
      return { error: `Cemitério "${cemeteryName}" não encontrado` };
    }

    // Validar que pelo menos GALSC ou número de sepultamento está preenchido
    if (!row.galsc?.trim() && !row.numero_sepultamento?.trim()) {
      return { error: 'É obrigatório informar GALSC ou Número de Sepultamento' };
    }

    // Campos obrigatórios
    if (!row.nome_falecido?.trim()) {
      return { error: 'Nome do falecido é obrigatório' };
    }

    if (!row.data_sepultamento?.trim()) {
      return { error: 'Data de sepultamento é obrigatória' };
    }

    if (!row.quadra?.trim() || !row.numero_jazigo?.trim()) {
      return { error: 'Quadra e número do jazigo são obrigatórios' };
    }

    // Validar tipo de sepultamento
    const validBurialTypes = ['INUMAÇÃO', 'TUMULAÇÃO(GAVETA)', 'EXUMAÇÃO', 'TRANSLADAÇÃO', 'CREMAÇÃO', 'REINUMAÇÃO', 'OSSÁRIO'];
    const burialType = row.tipo_sepultamento?.trim();
    if (burialType && !validBurialTypes.includes(burialType)) {
      return { error: `Tipo de sepultamento inválido. Valores aceitos: ${validBurialTypes.join(', ')}` };
    }

    // Validar status
    const validStatuses = ['Sepultado', 'Exumado', 'Transladado', 'Cremado'];
    const status = row.status_atual?.trim() || 'Sepultado';
    if (!validStatuses.includes(status)) {
      return { error: `Status inválido. Valores aceitos: ${validStatuses.join(', ')}` };
    }

    let warning = undefined;
    if (!row.data_nascimento?.trim() || !row.data_falecimento?.trim()) {
      warning = 'Recomendado preencher data de nascimento e falecimento';
    }

    const burial: Omit<Burial, 'id'> = {
      cemeteryId: cemetery.id,
      galsc: row.galsc?.trim() || undefined,
      burialNumber: row.numero_sepultamento?.trim() || undefined,
      deceasedName: row.nome_falecido.trim(),
      dateOfBirth: row.data_nascimento?.trim() || '',
      dateOfDeath: row.data_falecimento?.trim() || '',
      burialDate: row.data_sepultamento.trim(),
      quadra: row.quadra.trim(),
      plotNumber: row.numero_jazigo.trim(),
      sector: row.setor?.trim() || '',
      burialType: (burialType || 'INUMAÇÃO') as any,
      currentStatus: status as any,
      responsibleName: row.nome_responsavel?.trim() || '',
      responsiblePhone: row.telefone_responsavel?.trim() || '',
      notes: row.observacoes?.trim() || undefined,
      regularizationPeriodYears: row.periodo_regularizacao_anos ? parseInt(row.periodo_regularizacao_anos) : 5,
      nextRegularizationDate: row.proxima_regularizacao?.trim() || undefined,
      lastRegularizationDate: row.ultima_regularizacao?.trim() || undefined
    };

    return { burial, warning };
  };

  const parseLeaseRow = (row: any, rowIndex: number): { lease?: Omit<Lease, 'id'>; error?: string; warning?: string } => {
    const cemeteryName = row.nome_cemiterio?.trim();
    const cemetery = findCemeteryByName(cemeteryName);

    if (!cemeteryName) {
      return { error: 'Nome do cemitério é obrigatório' };
    }

    if (!cemetery) {
      return { error: `Cemitério "${cemeteryName}" não encontrado` };
    }

    // Campos obrigatórios
    if (!row.nome_titular?.trim()) {
      return { error: 'Nome do titular é obrigatório' };
    }

    if (!row.quadra?.trim() || !row.numero_jazigo?.trim()) {
      return { error: 'Quadra e número do jazigo são obrigatórios' };
    }

    if (!row.data_inicio?.trim()) {
      return { error: 'Data de início é obrigatória' };
    }

    // Validar tipo de aforamento
    const validLeaseTypes = ['Perpétuo', 'Temporário'];
    const leaseType = row.tipo_aforamento?.trim() || 'Perpétuo';
    if (!validLeaseTypes.includes(leaseType)) {
      return { error: `Tipo de aforamento inválido. Valores aceitos: ${validLeaseTypes.join(', ')}` };
    }

    // Validar status
    const validStatuses = ['Ativo', 'Vencido', 'Renovado'];
    const status = row.status?.trim() || 'Ativo';
    if (!validStatuses.includes(status)) {
      return { error: `Status inválido. Valores aceitos: ${validStatuses.join(', ')}` };
    }

    let warning = undefined;
    if (leaseType === 'Temporário' && !row.data_vencimento?.trim()) {
      warning = 'Aforamento temporário deve ter data de vencimento';
    }

    const lease: Omit<Lease, 'id'> = {
      cemeteryId: cemetery.id,
      leaseholderName: row.nome_titular.trim(),
      quadra: row.quadra.trim(),
      plotNumber: row.numero_jazigo.trim(),
      sector: row.setor?.trim() || '',
      leaseType: leaseType as any,
      startDate: row.data_inicio.trim(),
      expiryDate: row.data_vencimento?.trim() || undefined,
      status: status as any,
      amount: row.valor ? parseFloat(row.valor) : 0,
      responsibleName: row.nome_responsavel?.trim() || '',
      responsiblePhone: row.telefone_responsavel?.trim() || '',
      notes: row.observacoes?.trim() || undefined,
      regularizationPeriodYears: row.periodo_regularizacao_anos ? parseInt(row.periodo_regularizacao_anos) : 5,
      nextRegularizationDate: row.proxima_regularizacao?.trim() || undefined,
      lastRegularizationDate: row.ultima_regularizacao?.trim() || undefined
    };

    return { lease, warning };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);
    setPreviewData([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewData(results.data.slice(0, 5)); // Preview primeiras 5 linhas
        setImporting(false);
      },
      error: (error) => {
        alert('Erro ao ler arquivo: ' + error.message);
        setImporting(false);
      }
    });
  };

  const processImport = () => {
    if (previewData.length === 0) {
      alert('Nenhum dado para importar');
      return;
    }

    setImporting(true);

    const importResult: ImportResult = {
      success: 0,
      errors: [],
      warnings: []
    };

    if (importType === 'burials') {
      const validBurials: Omit<Burial, 'id'>[] = [];

      previewData.forEach((row, index) => {
        const { burial, error, warning } = parseBurialRow(row, index + 2); // +2 porque linha 1 é header

        if (error) {
          importResult.errors.push({ row: index + 2, error, data: row });
        } else if (burial) {
          validBurials.push(burial);
          importResult.success++;
          if (warning) {
            importResult.warnings.push({ row: index + 2, warning, data: row });
          }
        }
      });

      if (validBurials.length > 0) {
        onImportBurials(validBurials);
      }
    } else {
      const validLeases: Omit<Lease, 'id'>[] = [];

      previewData.forEach((row, index) => {
        const { lease, error, warning } = parseLeaseRow(row, index + 2);

        if (error) {
          importResult.errors.push({ row: index + 2, error, data: row });
        } else if (lease) {
          validLeases.push(lease);
          importResult.success++;
          if (warning) {
            importResult.warnings.push({ row: index + 2, warning, data: row });
          }
        }
      });

      if (validLeases.length > 0) {
        onImportLeases(validLeases);
      }
    }

    setResult(importResult);
    setImporting(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Importar Dados de Planilha
              </CardTitle>
              <CardDescription>
                Importe sepultamentos ou aforamentos em massa através de arquivo CSV
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de Importação */}
          <Tabs value={importType} onValueChange={(v) => setImportType(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="burials">Sepultamentos</TabsTrigger>
              <TabsTrigger value="leases">Aforamentos</TabsTrigger>
            </TabsList>

            {/* Visualização do Template */}
            <TabsContent value="burials" className="mt-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">📋 Estrutura do Template - Sepultamentos</CardTitle>
                  <CardDescription>
                    Campos disponíveis para importação (em negrito = obrigatório)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Campo</TableHead>
                          <TableHead className="w-[120px]">Obrigatório</TableHead>
                          <TableHead>Descrição / Exemplo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-bold">nome_cemiterio</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Nome exato do cemitério. Ex: SÃO FRANCISCO DE ASSIS</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">galsc</TableCell>
                          <TableCell><Badge>Condicional*</Badge></TableCell>
                          <TableCell>Número GALSC. Ex: GALSC-2024-0001</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">numero_sepultamento</TableCell>
                          <TableCell><Badge>Condicional*</Badge></TableCell>
                          <TableCell>Número do sepultamento. Ex: 0001</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">nome_falecido</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Nome completo do falecido. Ex: João Silva Santos</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>data_nascimento</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 1945-03-15</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>data_falecimento</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 2024-12-10</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">data_sepultamento</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 2024-12-12</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">quadra</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Identificação da quadra. Ex: A</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">numero_jazigo</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Número do jazigo. Ex: 123</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>setor</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Setor dentro do cemitério. Ex: Setor A</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>tipo_sepultamento</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>
                            INUMAÇÃO, TUMULAÇÃO(GAVETA), EXUMAÇÃO, TRANSLADAÇÃO, CREMAÇÃO, REINUMAÇÃO, OSSÁRIO
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>status_atual</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Sepultado, Exumado, Transladado, Cremado</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>nome_responsavel</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Nome do responsável. Ex: Maria Silva</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>telefone_responsavel</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Telefone. Ex: (11) 98888-7777</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>observacoes</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Observações gerais sobre o sepultamento</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>periodo_regularizacao_anos</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Período em anos para regularização. Padrão: 5</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>proxima_regularizacao</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 2029-12-12</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>ultima_regularizacao</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 2024-12-12</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-orange-600 mt-4">
                    * Condicional: É obrigatório informar GALSC <strong>OU</strong> Número de Sepultamento (pelo menos um dos dois)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leases" className="mt-6">
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg">📋 Estrutura do Template - Aforamentos</CardTitle>
                  <CardDescription>
                    Campos disponíveis para importação (em negrito = obrigatório)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Campo</TableHead>
                          <TableHead className="w-[120px]">Obrigatório</TableHead>
                          <TableHead>Descrição / Exemplo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-bold">nome_cemiterio</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Nome exato do cemitério. Ex: SÃO FRANCISCO DE ASSIS</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">nome_titular</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Nome do titular do aforamento. Ex: Ana Paula Rodrigues</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">quadra</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Identificação da quadra. Ex: A</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">numero_jazigo</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Número do jazigo. Ex: A-456</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>setor</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Setor dentro do cemitério. Ex: Setor A</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>tipo_aforamento</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Perpétuo ou Temporário. Padrão: Perpétuo</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">data_inicio</TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 2020-05-10</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>data_vencimento</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 2028-03-15 (obrigatório se Temporário)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>status</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Ativo, Vencido, Renovado. Padrão: Ativo</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>valor</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Valor do aforamento. Ex: 5000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>nome_responsavel</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Nome do responsável. Ex: João Pereira</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>telefone_responsavel</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Telefone. Ex: 1122334455</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>observacoes</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Observações gerais sobre o aforamento</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>periodo_regularizacao_anos</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Período em anos (apenas para perpétuos). Padrão: 5</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>proxima_regularizacao</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 2025-05-10</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>ultima_regularizacao</TableCell>
                          <TableCell><Badge variant="outline">Não</Badge></TableCell>
                          <TableCell>Formato: AAAA-MM-DD. Ex: 2020-05-10</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Instruções */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Instruções:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Baixe o template CSV clicando no botão abaixo</li>
                <li>Preencha os dados na planilha (Excel, Google Sheets, etc.)</li>
                <li>Salve como CSV (UTF-8)</li>
                <li>Faça o upload do arquivo preenchido</li>
                <li>Revise os dados e confirme a importação</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Download Template */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => downloadTemplate('burials')}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Template - Sepultamentos
            </Button>
            <Button 
              variant="outline" 
              onClick={() => downloadTemplate('leases')}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Template - Aforamentos
            </Button>
          </div>

          {/* Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              Selecione o arquivo CSV para importar
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Arquivo deve estar no formato CSV (UTF-8)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={importing}
            />
            <label htmlFor="csv-upload">
              <Button asChild disabled={importing}>
                <span>
                  <FileText className="w-4 h-4 mr-2" />
                  {importing ? 'Carregando...' : 'Selecionar Arquivo CSV'}
                </span>
              </Button>
            </label>
          </div>

          {/* Preview dos Dados */}
          {previewData.length > 0 && !result && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Preview dos Dados</CardTitle>
                <CardDescription>
                  Mostrando até 5 primeiras linhas. Total de {previewData.length} registros.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        {Object.keys(previewData[0] || {}).slice(0, 6).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          {Object.values(row).slice(0, 6).map((value: any, i) => (
                            <TableCell key={i} className="text-sm">
                              {value || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setPreviewData([])}>
                    Cancelar
                  </Button>
                  <Button onClick={processImport} disabled={importing}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Importação
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resultado da Importação */}
          {result && (
            <Card className={result.errors.length > 0 ? 'border-orange-300' : 'border-green-300'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.errors.length === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  )}
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{result.success}</div>
                    <div className="text-sm text-gray-600">Importados</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{result.errors.length}</div>
                    <div className="text-sm text-gray-600">Erros</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{result.warnings.length}</div>
                    <div className="text-sm text-gray-600">Avisos</div>
                  </div>
                </div>

                {/* Erros */}
                {result.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Erros Encontrados
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.errors.map((err, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertDescription>
                            <strong>Linha {err.row}:</strong> {err.error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avisos */}
                {result.warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Avisos
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.warnings.map((warn, index) => (
                        <Alert key={index}>
                          <AlertDescription>
                            <strong>Linha {warn.row}:</strong> {warn.warning}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setResult(null)}>
                    Nova Importação
                  </Button>
                  <Button onClick={onClose}>
                    Concluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}