export type DasStatus = "pago" | "pendente";

export interface DasRegistro {
  id: number;
  mesReferencia: string; // YYYY-MM
  valor: number;
  status: DasStatus;
  dataVencimento: string; // YYYY-MM-DD
  arquivoId: string | null;
}

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const DAS_DUE_DAY = 20;

export function vencimentoDoMes(mesReferencia: string): string {
  return `${mesReferencia}-${String(DAS_DUE_DAY).padStart(2, "0")}`;
}

export function labelMesReferencia(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split("-");
  const nome = MESES[Number(mes) - 1] ?? mes;
  return `${nome} de ${ano}`;
}
