// ============================================================
// TIPOS DE DADOS DO APP
// ============================================================
// Em TypeScript, "tipos" definem o FORMATO dos dados.
// É como um formulário em branco: ele diz quais campos
// existem e que tipo de informação cada um aceita.
//
// Por que isso importa? Sem tipos, você poderia acidentalmente
// salvar "abc" num campo que deveria ser número, e o erro
// só apareceria quando o usuário reclamasse. Com tipos, o
// editor já avisa antes de você rodar o código.
//
// CONCEITO: "type" vs "interface"
// Ambos definem formatos de dados. "type" é mais flexível
// (pode ser uma união de valores, como tipo: 'receita' | 'despesa').
// "interface" é mais usado para objetos complexos.
// Aqui usamos "type" por simplicidade.
// ============================================================

// Um lançamento financeiro (receita ou despesa)
export type Lancamento = {
  id: string;              // Identificador único (timestamp em string)
  tipo: 'receita' | 'despesa';  // Só aceita esses dois valores
  valor: number;           // Valor em reais (ex: 1500.50)
  categoria: string;       // Ex: "Serviços Prestados", "Material"
  data: string;            // Data no formato ISO (ex: "2026-08-19")
  descricao: string;       // Descrição opcional
  arquivoId: string | null; // Referência ao arquivo no IndexedDB (NF)
};

// Um registro de DAS (boleto mensal do MEI)
export type RegistroDAS = {
  id: string;
  mesReferencia: string;   // Formato "YYYY-MM" (ex: "2026-08")
  valor: number;           // Valor do DAS (ex: 75.90)
  status: 'pago' | 'pendente';
  dataVencimento: string;  // Data ISO do vencimento
  arquivoId: string | null; // Comprovante no IndexedDB
};

// Um arquivo armazenado (NF ou comprovante DAS)
export type ArquivoArmazenado = {
  id: string;
  nome: string;            // Nome original do arquivo
  tipo: string;            // MIME type (ex: "application/pdf", "image/jpeg")
  blob: Blob;              // O arquivo em si (dados binários)
  criadoEm: number;        // Timestamp de quando foi salvo
};

// Categorias disponíveis para cada tipo de lançamento
export const CATEGORIAS_RECEITA = [
  'Vendas',
  'Serviços Prestados',
  'Comissões',
  'Outros',
] as const;

export const CATEGORIAS_DESPESA = [
  'Material',
  'Transporte',
  'Alimentação',
  'Internet / Telefone',
  'Aluguel',
  'Marketing',
  'Contador',
  'Outros',
] as const;

// Configurações do MEI
export type ConfigMEI = {
  nome: string;
  cnpj: string;
  limiteAnual: number;     // Padrão: 81000
  diaDAS: number;          // Padrão: 20
};
