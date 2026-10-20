import { create } from "zustand";
import { persist } from "zustand/middleware";
export interface Bill { id: string; title: string; amount: number; dueDate: string; paid: boolean; }
export type FinanceEntryType = "income" | "expense" | "saving" | "investment" | "transfer";
export type PaymentMethod = "pix" | "debit" | "credit" | "cash" | "transfer";
export interface FinanceEntry { id: string; title: string; amount: number; date: string; type: FinanceEntryType; category: string; method?: PaymentMethod; fromAccountId?: string; toAccountId?: string; recurring?: boolean; installments?: number; currentInstallment?: number; dueDate?: string; settled?: boolean; settledMonths?: string[]; card?: string; }
export interface InvestmentAccount { id: string; name: string; kind: string; balance: number; role?: "available" | "investment"; purpose?: string; }
export interface CreditCard { id: string; name: string; closingDay: number; dueDay: number; limit?: number; }
interface FinanceStore {
  bills: Bill[]; entries: FinanceEntry[]; accounts: InvestmentAccount[]; cards: CreditCard[];
  addBill: (bill: Bill) => void; toggleBill: (id: string) => void; removeBill: (id: string) => void;
  updateBill: (id: string, values: Partial<Omit<Bill, "id">>) => void;
  addEntry: (entry: FinanceEntry) => void; removeEntry: (id: string) => void;
  updateEntry: (id: string, values: Partial<Omit<FinanceEntry, "id">>) => void;
  toggleEntrySettled: (id: string) => void;
  toggleEntryMonth: (id: string, month: string) => void;
  addAccount: (account: InvestmentAccount) => void; updateAccount: (id: string, balance: number) => void; removeAccount: (id: string) => void;
  addCard: (card: CreditCard) => void; removeCard: (id: string) => void;
}
export const useFinanceStore = create<FinanceStore>()(persist((set) => ({
  bills: [],
  entries: [],
  accounts: [
    { id: "checking-main", name: "Conta principal", kind: "Conta corrente", balance: 0, role: "available" },
    { id: "cash", name: "Dinheiro", kind: "Carteira", balance: 0, role: "available" },
    { id: "nubank-turbo", name: "Caixinha Turbo Nubank", kind: "Investimento", balance: 0, role: "investment", purpose: "Reserva de emergência" },
    { id: "nubank-normal", name: "Caixinha Nubank", kind: "Investimento", balance: 0, role: "investment", purpose: "Objetivos" },
  ],
  cards: [],
  addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),
  toggleBill: (id) => set((state) => ({ bills: state.bills.map((bill) => bill.id === id ? { ...bill, paid: !bill.paid } : bill) })),
  removeBill: (id) => set((state) => ({ bills: state.bills.filter((bill) => bill.id !== id) })),
  updateBill: (id, values) => set((state) => ({ bills: state.bills.map((bill) => bill.id === id ? { ...bill, ...values } : bill) })),
  addEntry: (entry) => set((state) => ({ entries: [...(state.entries ?? []), entry] })),
  removeEntry: (id) => set((state) => ({ entries: (state.entries ?? []).filter((entry) => entry.id !== id) })),
  updateEntry: (id, values) => set((state) => ({ entries: (state.entries ?? []).map((entry) => entry.id === id ? { ...entry, ...values } : entry) })),
  toggleEntrySettled: (id) => set((state) => ({ entries: (state.entries ?? []).map((entry) => entry.id === id ? { ...entry, settled: !entry.settled } : entry) })),
  toggleEntryMonth: (id, month) => set((state) => ({ entries: (state.entries ?? []).map((entry) => {
    if (entry.id !== id) return entry;
    const months = entry.settledMonths ?? [];
    return { ...entry, settledMonths: months.includes(month) ? months.filter((value) => value !== month) : [...months, month] };
  }) })),
  addAccount: (account) => set((state) => ({ accounts: [...(state.accounts ?? []), account] })),
  updateAccount: (id, balance) => set((state) => ({ accounts: (state.accounts ?? []).map((account) => account.id === id ? { ...account, balance } : account) })),
  removeAccount: (id) => set((state) => ({ accounts: (state.accounts ?? []).filter((account) => account.id !== id) })),
  addCard: (card) => set((state) => ({ cards: [...(state.cards ?? []), card] })),
  removeCard: (id) => set((state) => ({ cards: (state.cards ?? []).filter((card) => card.id !== id) })),
}), {
  name: "david-hub-bills",
  version: 3,
  migrate: (persisted) => {
    const state = persisted as Partial<FinanceStore>;
    const previousAccounts = (state.accounts ?? []).map((account) => ({
      ...account,
      role: account.role ?? "investment" as const,
      purpose: account.purpose ?? (account.name.includes("Turbo") ? "Reserva de emergência" : "Objetivos"),
    }));
    const accounts = previousAccounts.some((account) => account.role === "available")
      ? previousAccounts
      : [
          { id: "checking-main", name: "Conta principal", kind: "Conta corrente", balance: 0, role: "available" as const },
          { id: "cash", name: "Dinheiro", kind: "Carteira", balance: 0, role: "available" as const },
          ...previousAccounts,
        ];
    return {
      ...state,
      entries: state.entries ?? [],
      cards: state.cards ?? [],
      accounts: accounts.length ? accounts : [
        { id: "checking-main", name: "Conta principal", kind: "Conta corrente", balance: 0, role: "available" },
        { id: "cash", name: "Dinheiro", kind: "Carteira", balance: 0, role: "available" },
        { id: "nubank-turbo", name: "Caixinha Turbo Nubank", kind: "Investimento", balance: 0, role: "investment", purpose: "Reserva de emergência" },
        { id: "nubank-normal", name: "Caixinha Nubank", kind: "Investimento", balance: 0, role: "investment", purpose: "Objetivos" },
      ],
    } as FinanceStore;
  },
}));
