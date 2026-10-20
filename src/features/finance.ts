import type { FinanceEntry, InvestmentAccount } from "../stores/useFinanceStore";
import { localDate } from "../utils/calendar.ts";
export function calculateBalance(account: InvestmentAccount, entries: FinanceEntry[]) { const today = localDate(); const currentMonth = today.slice(0, 7); return entries.reduce((balance, entry) => {
  if (entry.date > today && !(entry.type === "expense" && entry.method === "credit")) return balance;
  const elapsedMonths = monthDistance(entry.date.slice(0, 7), currentMonth);
  const occurrences = entry.recurring && elapsedMonths >= 0 ? elapsedMonths + 1 : 1;
  if (entry.type === "income" && entry.toAccountId === account.id) return balance + entry.amount * occurrences;
  if (entry.type === "expense" && entry.fromAccountId === account.id) { if (entry.method === "credit") return balance - entry.amount * ((entry.settledMonths?.length ?? 0) || (entry.settled ? 1 : 0)); return balance - entry.amount * occurrences; }
  if (entry.type === "transfer") { if (entry.fromAccountId === account.id) balance -= entry.amount; if (entry.toAccountId === account.id) balance += entry.amount; }
  return balance;
}, account.balance); }

function monthDistance(start: string, target: string) { const [sy, sm] = start.split("-").map(Number); const [ty, tm] = target.split("-").map(Number); return (ty - sy) * 12 + tm - sm; }
