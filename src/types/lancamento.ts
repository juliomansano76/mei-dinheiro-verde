export type LancamentoTipo = "receita" | "despesa";

export interface Lancamento {
  id: number;
  tipo: LancamentoTipo;
  valor: number;
  categoria: string;
  data: string; // YYYY-MM-DD
  descricao: string;
}

export const CATEGORIAS_RECEITA = [
  "Vendas",
  "Serviços Prestados",
  "Comissões",
] as const;

export const CATEGORIAS_DESPESA = [
  "Material",
  "Transporte",
  "Alimentação",
  "Internet/Telefone",
  "Aluguel",
  "Marketing",
  "Outros",
] as const;

export function categoriasPorTipo(tipo: LancamentoTipo): readonly string[] {
  return tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
}
