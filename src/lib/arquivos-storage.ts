import { createStore, del, get, set } from "idb-keyval";

export interface ArquivoRecord {
  id: string;
  nome: string;
  tipo: string;
  blob: Blob;
  criadoEm: number;
}

let storeRef: ReturnType<typeof createStore> | null = null;

function store() {
  if (typeof window === "undefined") return undefined;
  if (!storeRef) storeRef = createStore("mei-financas", "arquivos");
  return storeRef;
}

export function novoArquivoId(): string {
  return `arq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveArquivo(file: File): Promise<string> {
  const id = novoArquivoId();
  const record: ArquivoRecord = {
    id,
    nome: file.name,
    tipo: file.type,
    blob: file,
    criadoEm: Date.now(),
  };
  await set(id, record, store());
  return id;
}

export async function getArquivo(id: string): Promise<ArquivoRecord | undefined> {
  return (await get<ArquivoRecord>(id, store())) ?? undefined;
}

export async function deleteArquivo(id: string): Promise<void> {
  await del(id, store());
}

export async function openArquivo(id: string): Promise<boolean> {
  const record = await getArquivo(id);
  if (!record) return false;
  const url = URL.createObjectURL(record.blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.download = record.nome || "arquivo";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return true;
}
