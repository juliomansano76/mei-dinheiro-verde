import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  generateId,
  loadFinanceState,
  saveFinanceState,
} from "@/lib/storage";
import type {
  FinanceState,
  Transaction,
  TransactionType,
} from "@/types/finance";
import {
  DEFAULT_ANNUAL_LIMIT,
  DEFAULT_DAS_DUE_DAY,
} from "@/types/finance";

function getDemoData(): FinanceState {
  const today = new Date();
  const currentMonth = format(today, "yyyy-MM");
  return {
    transactions: [
      {
        id: generateId(),
        description: "Serviço de consultoria",
        amount: 3200,
        type: "income" as TransactionType,
        date: `${currentMonth}-05`,
        category: "Receita de serviço",
      },
      {
        id: generateId(),
        description: "Venda de produto",
        amount: 1500,
        type: "income" as TransactionType,
        date: `${currentMonth}-12`,
        category: "Vendas",
      },
      {
        id: generateId(),
        description: "Material de escritório",
        amount: 280,
        type: "expense" as TransactionType,
        date: `${currentMonth}-08`,
        category: "Despesas operacionais",
      },
      {
        id: generateId(),
        description: "Internet e telefone",
        amount: 150,
        type: "expense" as TransactionType,
        date: `${currentMonth}-15`,
        category: "Despesas operacionais",
      },
    ],
    settings: {
      userName: "MEI",
      annualRevenueLimit: DEFAULT_ANNUAL_LIMIT,
      dasDueDay: DEFAULT_DAS_DUE_DAY,
    },
  };
}

function ensureState(): FinanceState {
  const saved = loadFinanceState();
  if (saved) return saved;
  const demo = getDemoData();
  saveFinanceState(demo);
  return demo;
}

export function useFinanceData() {
  const [state, setState] = useState<FinanceState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(ensureState());
    setHydrated(true);
  }, []);

  const persist = (next: FinanceState) => {
    setState(next);
    saveFinanceState(next);
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    if (!state) return;
    const next: FinanceState = {
      ...state,
      transactions: [
        { ...transaction, id: generateId() },
        ...state.transactions,
      ],
    };
    persist(next);
  };

  const removeTransaction = (id: string) => {
    if (!state) return;
    persist({
      ...state,
      transactions: state.transactions.filter((t) => t.id !== id),
    });
  };

  const updateSettings = (settings: Partial<FinanceState["settings"]>) => {
    if (!state) return;
    persist({
      ...state,
      settings: { ...state.settings, ...settings },
    });
  };

  const currentMonth = format(new Date(), "yyyy-MM");
  const currentYear = format(new Date(), "yyyy");

  const monthlyIncome = useMemo(() => {
    if (!state) return 0;
    return state.transactions
      .filter((t) => t.type === "income" && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state, currentMonth]);

  const monthlyExpense = useMemo(() => {
    if (!state) return 0;
    return state.transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state, currentMonth]);

  const annualRevenue = useMemo(() => {
    if (!state) return 0;
    return state.transactions
      .filter((t) => t.type === "income" && t.date.startsWith(currentYear))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state, currentYear]);

  const monthlyBalance = monthlyIncome - monthlyExpense;
  const revenueProgress = Math.min(
    (annualRevenue / (state?.settings.annualRevenueLimit ?? DEFAULT_ANNUAL_LIMIT)) * 100,
    100,
  );

  const recentTransactions = useMemo(() => {
    if (!state) return [];
    return [...state.transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .slice(0, 5);
  }, [state]);

  return {
    state,
    hydrated,
    userName: state?.settings.userName ?? "MEI",
    annualLimit: state?.settings.annualRevenueLimit ?? DEFAULT_ANNUAL_LIMIT,
    dasDueDay: state?.settings.dasDueDay ?? DEFAULT_DAS_DUE_DAY,
    monthlyIncome,
    monthlyExpense,
    monthlyBalance,
    annualRevenue,
    revenueProgress,
    recentTransactions,
    transactions: state?.transactions ?? [],
    addTransaction,
    removeTransaction,
    updateSettings,
  };
}
