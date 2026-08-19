import { useState, useEffect, useCallback } from 'react';
import type { Lancamento, RegistroDAS, ConfigMEI } from '../types/financas';

const CHAVES = {
  lancamentos: 'mei_lancamentos',
  das: 'mei_das',
  config: 'mei_config',
} as const;

const CONFIG_PADRAO: ConfigMEI = {
  nome: '',
  cnpj: '',
  limiteAnual: 81000,
  diaDAS: 20,
};

function lerDoStorage<T>(chave: string, padrao: T): T {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? (JSON.parse(dados) as T) : padrao;
  } catch {
    return padrao;
  }
}

function salvarNoStorage<T>(chave: string, dados: T): void {
  try { localStorage.setItem(chave, JSON.stringify(dados)); } catch (e) { console.error(e); }
}

export function useFinancas() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [registrosDAS, setRegistrosDAS] = useState<RegistroDAS[]>([]);
  const [config, setConfig] = useState<ConfigMEI>(CONFIG_PADRAO);

  useEffect(() => {
    setLancamentos(lerDoStorage<Lancamento[]>(CHAVES.lancamentos, []));
    setRegistrosDAS(lerDoStorage<RegistroDAS[]>(CHAVES.das, []));
    setConfig(lerDoStorage<ConfigMEI>(CHAVES.config, CONFIG_PADRAO));
  }, []);

  // LANÇAMENTOS
  const adicionarLancamento = useCallback((dados: Omit<Lancamento, 'id'>): Lancamento => {
    const novo: Lancamento = { ...dados, id: Date.now().toString() };
    setLancamentos((prev) => { const a = [novo, ...prev]; salvarNoStorage(CHAVES.lancamentos, a); return a; });
    return novo;
  }, []);

  const editarLancamento = useCallback((id: string, dados: Partial<Lancamento>) => {
    setLancamentos((prev) => { const a = prev.map((l) => l.id === id ? { ...l, ...dados } : l); salvarNoStorage(CHAVES.lancamentos, a); return a; });
  }, []);

  const removerLancamento = useCallback((id: string) => {
    setLancamentos((prev) => { const a = prev.filter((l) => l.id !== id); salvarNoStorage(CHAVES.lancamentos, a); return a; });
  }, []);

  // DAS
  const adicionarDAS = useCallback((dados: Omit<RegistroDAS, 'id'>): RegistroDAS => {
    const novo: RegistroDAS = { ...dados, id: Date.now().toString() };
    setRegistrosDAS((prev) => { const a = [novo, ...prev]; salvarNoStorage(CHAVES.das, a); return a; });
    return novo;
  }, []);

  const atualizarStatusDAS = useCallback((id: string, status: 'pago' | 'pendente') => {
    setRegistrosDAS((prev) => { const a = prev.map((d) => d.id === id ? { ...d, status } : d); salvarNoStorage(CHAVES.das, a); return a; });
  }, []);

  const removerDAS = useCallback((id: string) => {
    setRegistrosDAS((prev) => { const a = prev.filter((d) => d.id !== id); salvarNoStorage(CHAVES.das, a); return a; });
  }, []);

  // CONFIG
  const salvarConfig = useCallback((novaConfig: Partial<ConfigMEI>) => {
    setConfig((prev) => { const a = { ...prev, ...novaConfig }; salvarNoStorage(CHAVES.config, a); return a; });
  }, []);

  // LIMPAR
  const limparTudo = useCallback(() => {
    setLancamentos([]); setRegistrosDAS([]);
    salvarNoStorage(CHAVES.lancamentos, []); salvarNoStorage(CHAVES.das, []);
  }, []);

  // CÁLCULOS POR MÊS
  function lancamentosDoMesAno(mes: number, ano: number) {
    return lancamentos.filter((l) => { const d = new Date(l.data); return d.getMonth() === mes && d.getFullYear() === ano; });
  }
  function receitasDoMesAno(mes: number, ano: number) { return lancamentosDoMesAno(mes, ano).filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0); }
  function despesasDoMesAno(mes: number, ano: number) { return lancamentosDoMesAno(mes, ano).filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0); }

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const faturamentoAnual = lancamentos.filter((l) => l.tipo === 'receita' && new Date(l.data).getFullYear() === anoAtual).reduce((s, l) => s + l.valor, 0);
  const percentualFaturamento = Math.min((faturamentoAnual / config.limiteAnual) * 100, 100);

  // CUSTOS FIXOS
  const recorrentes = lancamentos.filter((l) => l.recorrente && l.tipo === 'despesa');
  const custoFixoMensal = (() => {
    const cats: Record<string, number> = {};
    recorrentes.forEach((l) => { if (!cats[l.categoria] || l.valor > cats[l.categoria]) cats[l.categoria] = l.valor; });
    return Object.values(cats).reduce((s, v) => s + v, 0);
  })();

  // BACKUP
  function exportarDados(): string {
    return JSON.stringify({ lancamentos, registrosDAS, config, versao: 1, exportadoEm: new Date().toISOString() }, null, 2);
  }
  function importarDados(json: string): boolean {
    try {
      const dados = JSON.parse(json);
      if (dados.lancamentos) { setLancamentos(dados.lancamentos); salvarNoStorage(CHAVES.lancamentos, dados.lancamentos); }
      if (dados.registrosDAS) { setRegistrosDAS(dados.registrosDAS); salvarNoStorage(CHAVES.das, dados.registrosDAS); }
      if (dados.config) { setConfig(dados.config); salvarNoStorage(CHAVES.config, dados.config); }
      return true;
    } catch { return false; }
  }

  return {
    lancamentos, registrosDAS, config,
    adicionarLancamento, editarLancamento, removerLancamento,
    adicionarDAS, atualizarStatusDAS, removerDAS,
    salvarConfig, limparTudo,
    lancamentosDoMesAno, receitasDoMesAno, despesasDoMesAno,
    faturamentoAnual, percentualFaturamento, custoFixoMensal,
    exportarDados, importarDados, anoAtual,
  };
}
