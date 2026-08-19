import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addLancamento,
  loadLancamentos,
  removeLancamento,
} from "@/lib/lancamentos-storage";
import type { Lancamento } from "@/types/lancamento";

export function useLancamentos() {
  const [items, setItems] = useState<Lancamento[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setItems(loadLancamentos());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    const handler = () => refresh();
    window.addEventListener("lancamentos:updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("lancamentos:updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const add = useCallback(
    (input: Omit<Lancamento, "id">) => {
      addLancamento(input);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    (id: number) => {
      removeLancamento(id);
      refresh();
    },
    [refresh],
  );

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const yearPrefix = String(now.getFullYear());

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id),
    [items],
  );

  const monthItems = useMemo(
    () => sorted.filter((l) => l.data.startsWith(monthPrefix)),
    [sorted, monthPrefix],
  );

  const receitasMes = useMemo(
    () =>
      monthItems
        .filter((l) => l.tipo === "receita")
        .reduce((s, l) => s + l.valor, 0),
    [monthItems],
  );

  const despesasMes = useMemo(
    () =>
      monthItems
        .filter((l) => l.tipo === "despesa")
        .reduce((s, l) => s + l.valor, 0),
    [monthItems],
  );

  const receitaAnual = useMemo(
    () =>
      sorted
        .filter((l) => l.tipo === "receita" && l.data.startsWith(yearPrefix))
        .reduce((s, l) => s + l.valor, 0),
    [sorted, yearPrefix],
  );

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Lancamento[]>();
    for (const item of monthItems) {
      const list = map.get(item.data) ?? [];
      list.push(item);
      map.set(item.data, list);
    }
    return [...map.entries()];
  }, [monthItems]);

  return {
    hydrated,
    lancamentos: sorted,
    monthItems,
    groupedByDate,
    receitasMes,
    despesasMes,
    saldoMes: receitasMes - despesasMes,
    receitaAnual,
    ultimos: sorted.slice(0, 3),
    add,
    remove,
  };
}
