// ============================================================
// HOOK: useFinancas
// ============================================================
// CONCEITO: O que é um Hook?
// Um Hook é uma função especial do React que permite
// "plugar" lógica reutilizável em qualquer componente.
// O nome sempre começa com "use" (useFinancas, useState...).
//
// Este hook centraliza TODA a lógica de dados do app:
// - Ler lançamentos do localStorage
// - Salvar novos lançamentos
// - Calcular saldo, receitas, despesas
// - Gerenciar registros do DAS
//
// Qualquer tela que precisar de dados financeiros vai
// chamar useFinancas() e terá acesso a tudo.
//
// CONCEITO: localStorage
// É um "arquivo de texto" que o navegador guarda no celular.
// Funciona com pares chave-valor, como um dicionário:
//   chave "lancamentos" → valor "[{...}, {...}]"
// Só aceita texto (string), então precisamos converter
// objetos para JSON ao salvar e de JSON ao ler.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { Lancamento, RegistroDAS, ConfigMEI } from '../types/financas';

// Chaves do localStorage (centralizadas para evitar typos)
const CHAVES = {
  lancamentos: 'mei_lancamentos',
  das: 'mei_das',
  config: 'mei_config',
} as const;

// Configuração padrão do MEI
const CONFIG_PADRAO: ConfigMEI = {
  nome: '',
  cnpj: '',
  limiteAnual: 81000,
  diaDAS: 20,
};

// ============================================================
// Funções auxiliares para localStorage
// ============================================================

function lerDoStorage<T>(chave: string, padrao: T): T {
  try {
    const dados = localStorage.getItem(chave);
    if (dados) {
      return JSON.parse(dados) as T;
    }
    return padrao;
  } catch {
    // Se der erro no parse (dados corrompidos), retorna o padrão
    console.error(`Erro ao ler ${chave} do localStorage`);
    return padrao;
  }
}

function salvarNoStorage<T>(chave: string, dados: T): void {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch (erro) {
    console.error(`Erro ao salvar ${chave} no localStorage`, erro);
  }
}

// ============================================================
// O Hook principal
// ============================================================

export function useFinancas() {
  // Estado: lançamentos e registros DAS carregados do storage
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [registrosDAS, setRegistrosDAS] = useState<RegistroDAS[]>([]);
  const [config, setConfig] = useState<ConfigMEI>(CONFIG_PADRAO);

  // CONCEITO: useEffect
  // Roda uma função quando o componente "monta" (aparece na tela).
  // Aqui usamos para carregar os dados do localStorage na primeira vez.
  // O array vazio [] significa "rode só uma vez, na montagem".
  useEffect(() => {
    setLancamentos(lerDoStorage<Lancamento[]>(CHAVES.lancamentos, []));
    setRegistrosDAS(lerDoStorage<RegistroDAS[]>(CHAVES.das, []));
    setConfig(lerDoStorage<ConfigMEI>(CHAVES.config, CONFIG_PADRAO));
  }, []);

  // ============================================================
  // LANÇAMENTOS
  // ============================================================

  const adicionarLancamento = useCallback((
    dados: Omit<Lancamento, 'id'>
  ): Lancamento => {
    // CONCEITO: Omit<Lancamento, 'id'>
    // Significa "um Lancamento, mas sem o campo id".
    // O id é gerado automaticamente aqui dentro.

    const novoLancamento: Lancamento = {
      ...dados,
      id: Date.now().toString(),
    };

    setLancamentos((anteriores) => {
      const atualizados = [novoLancamento, ...anteriores];
      salvarNoStorage(CHAVES.lancamentos, atualizados);
      return atualizados;
    });

    return novoLancamento;
  }, []);

  const removerLancamento = useCallback((id: string) => {
    setLancamentos((anteriores) => {
      const atualizados = anteriores.filter((l) => l.id !== id);
      salvarNoStorage(CHAVES.lancamentos, atualizados);
      return atualizados;
    });
  }, []);

  // ============================================================
  // DAS
  // ============================================================

  const adicionarDAS = useCallback((
    dados: Omit<RegistroDAS, 'id'>
  ): RegistroDAS => {
    const novoRegistro: RegistroDAS = {
      ...dados,
      id: Date.now().toString(),
    };

    setRegistrosDAS((anteriores) => {
      const atualizados = [novoRegistro, ...anteriores];
      salvarNoStorage(CHAVES.das, atualizados);
      return atualizados;
    });

    return novoRegistro;
  }, []);

  const atualizarStatusDAS = useCallback((id: string, status: 'pago' | 'pendente') => {
    setRegistrosDAS((anteriores) => {
      const atualizados = anteriores.map((d) =>
        d.id === id ? { ...d, status } : d
      );
      salvarNoStorage(CHAVES.das, atualizados);
      return atualizados;
    });
  }, []);

  // ============================================================
  // CONFIGURAÇÃO
  // ============================================================

  const salvarConfig = useCallback((novaConfig: Partial<ConfigMEI>) => {
    setConfig((anterior) => {
      const atualizada = { ...anterior, ...novaConfig };
      salvarNoStorage(CHAVES.config, atualizada);
      return atualizada;
    });
  }, []);

  // ============================================================
  // CÁLCULOS — dados derivados dos lançamentos
  // ============================================================

  // Helpers de data
  const hoje = new Date();
  const mesAtual = hoje.getMonth();    // 0-11
  const anoAtual = hoje.getFullYear(); // 2026

  // Filtra lançamentos do mês atual
  const lancamentosDoMes = lancamentos.filter((l) => {
    const data = new Date(l.data);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  });

  // Receitas e despesas do mês
  const receitasDoMes = lancamentosDoMes
    .filter((l) => l.tipo === 'receita')
    .reduce((soma, l) => soma + l.valor, 0);

  const despesasDoMes = lancamentosDoMes
    .filter((l) => l.tipo === 'despesa')
    .reduce((soma, l) => soma + l.valor, 0);

  const saldoDoMes = receitasDoMes - despesasDoMes;

  // Faturamento anual (soma de TODAS as receitas do ano)
  const faturamentoAnual = lancamentos
    .filter((l) => {
      const data = new Date(l.data);
      return l.tipo === 'receita' && data.getFullYear() === anoAtual;
    })
    .reduce((soma, l) => soma + l.valor, 0);

  const percentualFaturamento = Math.min(
    (faturamentoAnual / config.limiteAnual) * 100,
    100
  );

  // Status do DAS do mês atual
  const mesAtualStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}`;
  const dasDoMes = registrosDAS.find((d) => d.mesReferencia === mesAtualStr);
  const dasEmDia = dasDoMes?.status === 'pago';

  // Últimos 3 lançamentos (para o Dashboard)
  const ultimosLancamentos = lancamentos
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 3);

  // ============================================================
  // RETORNO — tudo que as telas precisam
  // ============================================================

  return {
    // Dados brutos
    lancamentos,
    registrosDAS,
    config,

    // Ações
    adicionarLancamento,
    removerLancamento,
    adicionarDAS,
    atualizarStatusDAS,
    salvarConfig,

    // Dados calculados para o Dashboard
    lancamentosDoMes,
    receitasDoMes,
    despesasDoMes,
    saldoDoMes,
    faturamentoAnual,
    percentualFaturamento,
    dasDoMes,
    dasEmDia,
    ultimosLancamentos,
  };
}
