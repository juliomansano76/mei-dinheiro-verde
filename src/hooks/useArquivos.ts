// ============================================================
// HOOK: useArquivos
// ============================================================
// CONCEITO: IndexedDB
// Enquanto o localStorage é como um bloco de notas (só texto,
// limite de ~5MB), o IndexedDB é como um HD virtual no
// navegador. Ele aceita arquivos grandes (PDFs, imagens)
// e pode guardar centenas de MB.
//
// A API nativa do IndexedDB é complicada (usa callbacks,
// eventos, transações...), então este hook encapsula tudo
// em funções simples: salvar, buscar, listar, remover.
//
// CONCEITO: Promises e async/await
// Operações com IndexedDB são assíncronas — ou seja, não
// terminam instantaneamente. O "await" faz o código
// esperar o resultado antes de continuar. É como pedir
// um café: você faz o pedido (chama a função) e espera
// (await) o café ficar pronto antes de beber.
// ============================================================

import { useState, useCallback } from 'react';
import type { ArquivoArmazenado } from '../types/financas';

const DB_NOME = 'mei_financas_db';
const DB_VERSAO = 1;
const STORE_NOME = 'arquivos';

// ============================================================
// Abrir conexão com o banco IndexedDB
// ============================================================

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NOME, DB_VERSAO);

    // CONCEITO: onupgradeneeded
    // Roda quando o banco é criado pela primeira vez (ou
    // quando a versão muda). É aqui que definimos a
    // estrutura — como criar a "tabela" de arquivos.
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NOME)) {
        db.createObjectStore(STORE_NOME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================
// Operações CRUD (Create, Read, Update, Delete)
// ============================================================

async function salvarArquivoNoBanco(
  arquivo: ArquivoArmazenado
): Promise<void> {
  const db = await abrirBanco();
  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORE_NOME, 'readwrite');
    const store = transacao.objectStore(STORE_NOME);
    const request = store.put(arquivo);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function buscarArquivoDoBanco(
  id: string
): Promise<ArquivoArmazenado | null> {
  const db = await abrirBanco();
  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORE_NOME, 'readonly');
    const store = transacao.objectStore(STORE_NOME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function removerArquivoDoBanco(id: string): Promise<void> {
  const db = await abrirBanco();
  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORE_NOME, 'readwrite');
    const store = transacao.objectStore(STORE_NOME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================================
// O Hook
// ============================================================

export function useArquivos() {
  const [salvando, setSalvando] = useState(false);

  // Converte um File (do input de upload) para ArquivoArmazenado
  const salvarArquivo = useCallback(async (
    file: File
  ): Promise<string> => {
    setSalvando(true);
    try {
      const id = `arq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const arquivo: ArquivoArmazenado = {
        id,
        nome: file.name,
        tipo: file.type,
        blob: file,
        criadoEm: Date.now(),
      };

      await salvarArquivoNoBanco(arquivo);
      return id; // Retorna o ID para vincular ao lançamento/DAS
    } finally {
      setSalvando(false);
    }
  }, []);

  // Busca um arquivo pelo ID e gera uma URL temporária para visualizar
  const visualizarArquivo = useCallback(async (id: string): Promise<string | null> => {
    const arquivo = await buscarArquivoDoBanco(id);
    if (!arquivo) return null;

    // CONCEITO: URL.createObjectURL
    // Cria um link temporário (blob:http://...) que o navegador
    // entende. Serve para mostrar uma imagem ou abrir um PDF
    // sem precisar de servidor. O link só funciona enquanto
    // a aba estiver aberta.
    return URL.createObjectURL(arquivo.blob);
  }, []);

  // Busca e faz download do arquivo
  const baixarArquivo = useCallback(async (id: string): Promise<void> => {
    const arquivo = await buscarArquivoDoBanco(id);
    if (!arquivo) return;

    const url = URL.createObjectURL(arquivo.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = arquivo.nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const removerArquivo = useCallback(async (id: string): Promise<void> => {
    await removerArquivoDoBanco(id);
  }, []);

  return {
    salvarArquivo,
    visualizarArquivo,
    baixarArquivo,
    removerArquivo,
    salvando,
  };
}
