import type { Lancamento } from "@/types/lancamento";

export const LANCAMENTOS_KEY = "lancamentos";

export function loadLancamentos(): Lancamento[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LANCAMENTOS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Lancamento[]) : [];
  } catch {
    return [];
  }
}

export function saveLancamentos(items: Lancamento[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LANCAMENTOS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("lancamentos:updated"));
}

export function addLancamento(input: Omit<Lancamento, "id">): Lancamento {
  const item: Lancamento = { ...input, id: Date.now() };
  saveLancamentos([item, ...loadLancamentos()]);
  return item;
}

export function removeLancamento(id: number): void {
  saveLancamentos(loadLancamentos().filter((l) => l.id !== id));
}

export function parseCurrencyInput(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function maskCurrencyInput(masked: string): string {
  const value = parseCurrencyInput(masked);
  if (value === 0) return "";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
