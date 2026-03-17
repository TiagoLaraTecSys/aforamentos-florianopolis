import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Burial, Cemetery } from './CemeteryDashboard';

interface BurialCertificateProps {
  burial: Burial;
  cemetery: Cemetery;
}

export function BurialCertificate({ burial, cemetery }: BurialCertificateProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Certificado_Sepultamento_${burial.galsc || burial.burialNumber}`,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = () => {
    return format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          Imprimir Certificado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificado de Sepultamento</DialogTitle>
          <DialogDescription>
            Visualização do certificado - Clique em imprimir para gerar o documento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div ref={componentRef} className="bg-white p-12 print:p-12">
            {/* Cabeçalho */}
            <div className="border-4 border-gray-800 p-8">
              <div className="text-center mb-8">
                <div className="border-b-2 border-gray-600 pb-4 mb-4">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    CERTIFICADO DE SEPULTAMENTO
                  </h1>
                  <p className="text-sm text-gray-600">
                    Sistema de Gerenciamento de Cemitérios Municipais
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Prefeitura Municipal de Florianópolis - SC
                  </p>
                </div>
              </div>

              {/* Identificação */}
              <div className="mb-6 border-l-4 border-gray-700 pl-4">
                <h2 className="text-xl font-bold text-gray-800 mb-3">IDENTIFICAÇÃO</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {burial.galsc && (
                    <div>
                      <span className="font-semibold text-gray-700">GALSC:</span>
                      <span className="ml-2 text-gray-900 font-mono">{burial.galsc}</span>
                    </div>
                  )}
                  {burial.burialNumber && (
                    <div>
                      <span className="font-semibold text-gray-700">Nº Sepultamento:</span>
                      <span className="ml-2 text-gray-900 font-mono">{burial.burialNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dados do Falecido */}
              <div className="mb-6 border-l-4 border-gray-700 pl-4">
                <h2 className="text-xl font-bold text-gray-800 mb-3">DADOS DO FALECIDO</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Nome Completo:</span>
                    <div className="ml-2 text-gray-900 text-lg font-medium">{burial.deceasedName}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-gray-700">Data de Nascimento:</span>
                      <span className="ml-2 text-gray-900">{formatDate(burial.dateOfBirth)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Data do Óbito:</span>
                      <span className="ml-2 text-gray-900">{formatDate(burial.dateOfDeath)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados do Sepultamento */}
              <div className="mb-6 border-l-4 border-gray-700 pl-4">
                <h2 className="text-xl font-bold text-gray-800 mb-3">DADOS DO SEPULTAMENTO</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Data do Sepultamento:</span>
                    <span className="ml-2 text-gray-900">{formatDate(burial.burialDate)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Tipo de Sepultamento:</span>
                    <span className="ml-2 text-gray-900">{burial.burialType}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Status Atual:</span>
                    <span className="ml-2 text-gray-900">{burial.currentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div className="mb-6 border-l-4 border-gray-700 pl-4">
                <h2 className="text-xl font-bold text-gray-800 mb-3">LOCALIZAÇÃO</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Cemitério:</span>
                    <div className="ml-2 text-gray-900 text-base font-medium">{cemetery.name}</div>
                  </div>
                  <div className="text-gray-600 text-xs ml-2">{cemetery.address}</div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="font-semibold text-gray-700">Quadra:</span>
                      <span className="ml-2 text-gray-900 font-mono text-lg">{burial.quadra}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Sepultura:</span>
                      <span className="ml-2 text-gray-900 font-mono text-lg">{burial.plotNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsável */}
              <div className="mb-6 border-l-4 border-gray-700 pl-4">
                <h2 className="text-xl font-bold text-gray-800 mb-3">RESPONSÁVEL</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Nome:</span>
                    <span className="ml-2 text-gray-900">{burial.responsibleName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Telefone:</span>
                    <span className="ml-2 text-gray-900">{burial.responsiblePhone}</span>
                  </div>
                </div>
              </div>

              {burial.notes && (
                <div className="mb-6 border-l-4 border-gray-700 pl-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">OBSERVAÇÕES</h2>
                  <p className="text-sm text-gray-700">{burial.notes}</p>
                </div>
              )}

              {/* Rodapé */}
              <div className="mt-12 pt-6 border-t-2 border-gray-300">
                <div className="flex justify-between items-end">
                  <div className="text-xs text-gray-500">
                    <p>Documento gerado em: {formatDateTime()}</p>
                    <p className="mt-1">Este certificado possui validade legal</p>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-gray-600 pt-2 w-64">
                      <p className="text-xs font-semibold text-gray-700">
                        Assinatura do Responsável
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
