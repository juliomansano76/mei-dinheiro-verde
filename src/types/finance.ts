export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO date (YYYY-MM-DD)
  category: string;
}

export interface AppSettings {
  userName: string;
  annualRevenueLimit: number;
  dasDueDay: number;
}

export interface FinanceState {
  transactions: Transaction[];
  settings: AppSettings;
}

export const DEFAULT_ANNUAL_LIMIT = 81000;
export const DEFAULT_DAS_DUE_DAY = 20;
