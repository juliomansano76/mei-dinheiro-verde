import type { DasRegistro } from "@/types/das";

export const DAS_KEY = "das";

export function loadDas(): DasRegistro[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(DAS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DasRegistro[]) : [];
  } catch {
    return [];
  }
}

export function saveDas(items: DasRegistro[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DAS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("das:updated"));
}

export function addDas(input: Omit<DasRegistro, "id">): DasRegistro {
  const item: DasRegistro = { ...input, id: Date.now() };
  const rest = loadDas().filter((d) => d.mesReferencia !== input.mesReferencia);
  saveDas([item, ...rest]);
  return item;
}

export function updateDasStatus(id: number, status: DasRegistro["status"]): void {
  saveDas(loadDas().map((d) => (d.id === id ? { ...d, status } : d)));
}

export function removeDas(id: number): void {
  saveDas(loadDas().filter((d) => d.id !== id));
}
