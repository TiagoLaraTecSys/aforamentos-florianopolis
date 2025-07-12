<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sepultamento;
use Illuminate\Support\Facades\File;

class SepultamentoSeeder extends Seeder
{
    private $stats = [
        'total_linhas' => 0,
        'linhas_cabecalho' => 0,
        'linhas_poucas_colunas' => 0,
        'linhas_nome_vazio' => 0,
        'linhas_sem_data' => 0,
        'linhas_importadas' => 0,
        'linhas_com_erro' => 0,
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Caminho para o arquivo CSV (você pode alterar conforme necessário)
        $csvPath = storage_path('app/sepultamentos.csv');
        
        if (!File::exists($csvPath)) {
            $this->command->error("Arquivo CSV não encontrado em: {$csvPath}");
            $this->command->info("Por favor, coloque o arquivo CSV em: storage/app/sepultamentos.csv");
            return;
        }

        $csvData = array_map('str_getcsv', file($csvPath));
        $this->stats['total_linhas'] = count($csvData);
        
        $this->command->info("Total de linhas no arquivo: " . $this->stats['total_linhas']);
        
        // Remove as primeiras linhas que são cabeçalhos
        array_shift($csvData); // Remove primeira linha
        array_shift($csvData); // Remove segunda linha
        array_shift($csvData); // Remove terceira linha (cabeçalhos reais)
        $this->stats['linhas_cabecalho'] = 3;

        $this->command->info("Iniciando importação de " . count($csvData) . " registros...");

        $puladosPath = storage_path('app/sepultamentos_pulados.txt');
        $pulados = [];

        foreach ($csvData as $index => $row) {
            $linhaOriginal = $index + 4; // +4 porque removemos 3 cabeçalhos e o índice começa em 0
            
            // Verifica se a linha tem dados válidos
            if (count($row) < 8) {
                $this->stats['linhas_poucas_colunas']++;
                $this->command->warn("Linha {$linhaOriginal}: Poucas colunas (" . count($row) . " colunas)");
                $pulados[] = 'Linha ' . $linhaOriginal . ': POUCAS COLUNAS - ' . ($row[1] ?? '[sem nome]');
                continue;
            }
            
            if (empty(trim($row[1] ?? ''))) {
                $this->stats['linhas_nome_vazio']++;
                $this->command->warn("Linha {$linhaOriginal}: Nome vazio");
                $pulados[] = 'Linha ' . $linhaOriginal . ': NOME VAZIO';
                continue;
            }
            
            // Mapeia os campos baseado na estrutura do CSV
            $sepultamentoData = [
                'nome_falecido' => trim($row[1] ?? ''),
                'data_sepultamento' => $this->formatDate(trim($row[2] ?? '')),
                'quadra' => trim($row[3] ?? ''),
                'sepultura' => trim($row[4] ?? ''),
                'galsc' => trim($row[5] ?? ''),
                'cemiterio' => 'Cemitério Municipal', // Valor padrão
                'nome_servidor' => trim($row[6] ?? ''),
                'data_exumacao' => $this->formatDate(trim($row[8] ?? '')),
            ];

            // Verifica se tem dados mínimos necessários
            if (empty($sepultamentoData['nome_falecido'])) {
                $this->stats['linhas_sem_data']++;
                $this->command->warn("Linha {$linhaOriginal}: Sem nome - Nome: '{$sepultamentoData['nome_falecido']}'");
                $pulados[] = 'Linha ' . $linhaOriginal . ': SEM NOME';
                continue;
            }

            // Se não tem data válida, coloca null mas ainda importa o registro
            if (empty($sepultamentoData['data_sepultamento'])) {
                $this->command->warn("Linha {$linhaOriginal}: Data inválida - Nome: '{$sepultamentoData['nome_falecido']}', Data original: '{$row[2]}' - Importando com data NULL");
                $this->stats['linhas_sem_data']++;
            }

            try {
                Sepultamento::create($sepultamentoData);
                $this->stats['linhas_importadas']++;
                $this->command->info("Linha {$linhaOriginal}: Importado - " . $sepultamentoData['nome_falecido']);
            } catch (\Exception $e) {
                $this->stats['linhas_com_erro']++;
                $this->command->error("Linha {$linhaOriginal}: Erro ao importar - " . $sepultamentoData['nome_falecido'] . " - " . $e->getMessage());
                $pulados[] = 'Linha ' . $linhaOriginal . ': ERRO - ' . $sepultamentoData['nome_falecido'] . ' - ' . $e->getMessage();
            }
        }
        // Salva os nomes pulados no arquivo
        \Illuminate\Support\Facades\File::put($puladosPath, implode("\n", $pulados));

        $this->command->info("=== ESTATÍSTICAS DA IMPORTAÇÃO ===");
        $this->command->info("Total de linhas no arquivo: " . $this->stats['total_linhas']);
        $this->command->info("Linhas de cabeçalho removidas: " . $this->stats['linhas_cabecalho']);
        $this->command->info("Linhas com poucas colunas: " . $this->stats['linhas_poucas_colunas']);
        $this->command->info("Linhas com nome vazio: " . $this->stats['linhas_nome_vazio']);
        $this->command->info("Linhas sem data válida: " . $this->stats['linhas_sem_data']);
        $this->command->info("Linhas importadas com sucesso: " . $this->stats['linhas_importadas']);
        $this->command->info("Linhas com erro: " . $this->stats['linhas_com_erro']);
        
        $totalProcessado = $this->stats['linhas_importadas'] + $this->stats['linhas_com_erro'] + $this->stats['linhas_poucas_colunas'] + $this->stats['linhas_nome_vazio'] + $this->stats['linhas_sem_data'];
        $this->command->info("Total processado: " . $totalProcessado);
        $this->command->info("Diferença: " . ($this->stats['total_linhas'] - $this->stats['linhas_cabecalho'] - $totalProcessado) . " linhas não processadas");
        
        $this->command->info("Importação concluída!");
    }

    /**
     * Formata a data para o formato correto
     */
    private function formatDate($date)
    {
        if (empty($date)) {
            return null;
        }

        // Tenta diferentes formatos de data
        $formats = [
            'd/m/Y',
            'd-m-Y',
            'Y-m-d',
            'Y/m/d',
            'm/d/Y',
            'm-d-Y',
            'd/m/y',
            'd-m-y',
        ];

        foreach ($formats as $format) {
            $parsed = \DateTime::createFromFormat($format, $date);
            if ($parsed !== false) {
                // Corrige anos de dois dígitos
                $year = (int)$parsed->format('Y');
                if ($year < 100) {
                    $currentYear = (int)date('Y');
                    $century = ($year + 2000) <= $currentYear ? 2000 : 1900;
                    $year += $century;
                    $parsed->setDate($year, (int)$parsed->format('m'), (int)$parsed->format('d'));
                }
                return $parsed->format('Y-m-d');
            }
        }

        return null;
    }
}
