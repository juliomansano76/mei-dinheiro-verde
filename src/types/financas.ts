export type Lancamento = {
  id: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  categoria: string;
  data: string;
  descricao: string;
  arquivoId: string | null;
  recorrente: boolean;
};

export type RegistroDAS = {
  id: string;
  mesReferencia: string;
  valor: number;
  status: 'pago' | 'pendente';
  dataVencimento: string;
  arquivoId: string | null;
};

export type ArquivoArmazenado = {
  id: string;
  nome: string;
  tipo: string;
  blob: Blob;
  criadoEm: number;
};

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
  'DAS - Simples Nacional',
  'Outros',
] as const;

export type ConfigMEI = {
  nome: string;
  cnpj: string;
  limiteAnual: number;
  diaDAS: number;
};
