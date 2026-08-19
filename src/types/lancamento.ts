import {
  Briefcase,
  Bus,
  Car,
  Handshake,
  Home,
  Megaphone,
  Package,
  ShoppingBag,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react";

export type LancamentoTipo = "receita" | "despesa";

export interface Lancamento {
  id: number;
  tipo: LancamentoTipo;
  valor: number;
  categoria: string;
  data: string; // YYYY-MM-DD
  descricao: string;
  arquivoId: string | null;
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

const ICONES: Record<string, LucideIcon> = {
  Vendas: ShoppingBag,
  "Serviços Prestados": Briefcase,
  Comissões: Handshake,
  Material: Package,
  Transporte: Bus,
  Alimentação: Utensils,
  "Internet/Telefone": Wifi,
  Aluguel: Home,
  Marketing: Megaphone,
  Outros: Car,
};

export function iconePorCategoria(categoria: string): LucideIcon {
  return ICONES[categoria] ?? Package;
}
