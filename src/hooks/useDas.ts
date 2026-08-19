import { useCallback, useEffect, useMemo, useState } from "react";
import { addDas, loadDas, removeDas, updateDasStatus } from "@/lib/das-storage";
import type { DasRegistro, DasStatus } from "@/types/das";

export function useDas() {
  const [items, setItems] = useState<DasRegistro[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => setItems(loadDas()), []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    const handler = () => refresh();
    window.addEventListener("das:updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("das:updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const add = useCallback(
    (input: Omit<DasRegistro, "id">) => {
      addDas(input);
      refresh();
    },
    [refresh],
  );

  const setStatus = useCallback(
    (id: number, status: DasStatus) => {
      updateDasStatus(id, status);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    (id: number) => {
      removeDas(id);
      refresh();
    },
    [refresh],
  );

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia)),
    [items],
  );

  const now = new Date();
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dasMesAtual = useMemo(
    () => sorted.find((d) => d.mesReferencia === mesAtual) ?? null,
    [sorted, mesAtual],
  );

  return {
    hydrated,
    registros: sorted,
    mesAtual,
    dasMesAtual,
    add,
    setStatus,
    remove,
  };
}
