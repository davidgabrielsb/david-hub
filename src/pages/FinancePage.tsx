import { calculateBalance } from "../features/finance";
import { localDate } from "../utils/calendar";
import { useMemo, useState } from "react";
import { useFinanceStore, type FinanceEntry, type InvestmentAccount, type PaymentMethod } from "../stores/useFinanceStore";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";

type MovementType = "income" | "expense" | "transfer";
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const methodLabels: Record<PaymentMethod, string> = { pix: "Pix", debit: "Débito", credit: "Crédito", cash: "Dinheiro", transfer: "Transferência" };

export function FinancePage() {
  const store = useFinanceStore(); const entries = store.entries ?? []; const accounts = store.accounts ?? [];
  const [month, setMonth] = useState(localDate().slice(0, 7)); const [type, setType] = useState<MovementType>("expense");
  const [title, setTitle] = useState(""); const [amount, setAmount] = useState(""); const [date, setDate] = useState(localDate()); const [category, setCategory] = useState("Geral"); const [method, setMethod] = useState<PaymentMethod>("pix"); const [fromAccountId, setFromAccountId] = useState(""); const [toAccountId, setToAccountId] = useState(""); const [dueDate, setDueDate] = useState(""); const [installments, setInstallments] = useState("1"); const [recurring, setRecurring] = useState(false);
  const [accountName, setAccountName] = useState(""); const [accountKind, setAccountKind] = useState("Conta corrente"); const [accountRole, setAccountRole] = useState<"available" | "investment">("available"); const [accountPurpose, setAccountPurpose] = useState("");
  const [search, setSearch] = useState("");

  const balances = useMemo(() => Object.fromEntries(accounts.map((account) => [account.id, calculateBalance(account, entries)])), [accounts, entries]);
  const available = accounts.filter((account) => account.role !== "investment").reduce((total, account) => total + (balances[account.id] ?? 0), 0);
  const invested = accounts.filter((account) => account.role === "investment").reduce((total, account) => total + (balances[account.id] ?? 0), 0);
  const monthEntries = entries.filter((entry) => appliesToMonth(entry, month));
  const commitments = monthEntries.filter((entry) => entry.type === "expense" && entry.method === "credit" && !(entry.settledMonths ?? []).includes(month) && !entry.settled);
  const unpaidBills = store.bills.filter((bill) => !bill.paid); const committed = commitments.reduce((total, entry) => total + entry.amount, 0) + unpaidBills.reduce((total, bill) => total + bill.amount, 0);
  const monthIncome = monthEntries.filter((entry) => entry.type === "income").reduce((total, entry) => total + entry.amount, 0); const monthExpense = monthEntries.filter((entry) => entry.type === "expense").reduce((total, entry) => total + entry.amount, 0);
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const matchesEntry = (entry: FinanceEntry) => {
    const from = accounts.find((account) => account.id === entry.fromAccountId)?.name ?? "";
    const to = accounts.find((account) => account.id === entry.toAccountId)?.name ?? "";
    return !normalizedSearch || `${entry.title} ${entry.category} ${entry.method ?? ""} ${from} ${to} ${entry.amount}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
  };
  const visibleMonthEntries = monthEntries.filter(matchesEntry);
  const visibleCommitments = commitments.filter(matchesEntry);
  const visibleAccounts = accounts.filter((account) => !normalizedSearch || `${account.name} ${account.kind} ${account.purpose ?? ""}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch));
  const visibleBills = unpaidBills.filter((bill) => !normalizedSearch || `${bill.title} ${bill.amount}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch));

  function submit(event: React.FormEvent) {
    event.preventDefault(); const value = Number(amount); if (!title.trim() || value <= 0 || !date) return;
    if (type === "income" && !toAccountId) return; if (type === "expense" && !fromAccountId) return; if (type === "transfer" && (!fromAccountId || !toAccountId || fromAccountId === toAccountId)) return;
    store.addEntry({ id: crypto.randomUUID(), title: title.trim(), amount: value, date, type, category: category.trim() || "Geral", method: type === "expense" ? method : type === "transfer" ? "transfer" : undefined, fromAccountId: type !== "income" ? fromAccountId : undefined, toAccountId: type !== "expense" ? toAccountId : undefined, dueDate: type === "expense" && method === "credit" ? dueDate || undefined : undefined, installments: type === "expense" && method === "credit" ? Math.max(1, Number(installments)) : 1, recurring: type !== "transfer" && recurring, settledMonths: [] });
    setTitle(""); setAmount(""); setDueDate(""); setInstallments("1"); setRecurring(false);
  }

  return <section><header className="page-header"><div><h2>Finanças</h2><p>Controle onde seu dinheiro está, o que saiu e o que ainda está comprometido.</p></div><div className="page-header-actions"><PageSearch value={search} onChange={setSearch} placeholder="Buscar movimentação, conta ou valor..." /><MonthYearPicker value={month} onChange={setMonth} /></div></header>
    <div className="finance-summary"><FinanceCard label="Disponível" value={available} /><FinanceCard label="Comprometido" value={committed} /><FinanceCard label="Livre após compromissos" value={available - committed} emphasis /><FinanceCard label="Investido" value={invested} /><FinanceCard label="Patrimônio financeiro" value={available + invested} /><FinanceCard label="Gastos do mês" value={monthExpense} detail={`Entradas: ${money(monthIncome)}`} /></div>

    <div className="finance-section"><h3>Registrar movimentação</h3><p className="finance-help">Entrada adiciona dinheiro a uma conta. Saída retira. Transferência apenas muda o dinheiro de lugar.</p><form className="finance-simple-form" onSubmit={submit}>
      <div className="finance-type-picker finance-type-picker-three"><button type="button" className={type === "income" ? "active income" : ""} onClick={() => setType("income")}>Dinheiro entrou</button><button type="button" className={type === "expense" ? "active expense" : ""} onClick={() => setType("expense")}>Dinheiro saiu</button><button type="button" className={type === "transfer" ? "active saving" : ""} onClick={() => setType("transfer")}>Transferir entre contas</button></div>
      <label>Descrição<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "income" ? "Ex.: Salário" : type === "expense" ? "Ex.: Mercado" : "Ex.: Guardar na Caixinha"} required /></label><label>Valor<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label><label>Data<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label>Categoria<input value={category} onChange={(event) => setCategory(event.target.value)} /></label>
      {type !== "income" && <label>Saiu de<select required value={fromAccountId} onChange={(event) => setFromAccountId(event.target.value)}><option value="">Escolha a conta</option>{accounts.map(accountOption)}</select></label>}{type !== "expense" && <label>Entrou em<select required value={toAccountId} onChange={(event) => setToAccountId(event.target.value)}><option value="">Escolha a conta</option>{accounts.map(accountOption)}</select></label>}
      {type === "expense" && <><label>Como foi pago?<select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>{Object.entries(methodLabels).filter(([value]) => value !== "transfer").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{method === "credit" && <><label>Vencimento<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label>Parcelas<input type="number" min="1" value={installments} onChange={(event) => setInstallments(event.target.value)} /></label></>}<label className="finance-check"><input type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} /> Repetir todos os meses</label></>}
      {type === "income" && <label className="finance-check"><input type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} /> Repetir todos os meses</label>}<button className="finance-submit">Registrar movimentação</button>
    </form></div>

    <div className="finance-section"><h3>Onde está seu dinheiro</h3><p className="finance-help">O saldo inicial serve como ponto de partida. Depois, entradas, saídas e transferências atualizam o saldo calculado.</p><div className="account-grid">{visibleAccounts.map((account) => <article key={account.id}><div><span>{account.role === "investment" ? "Investimento" : "Disponível"}</span><h4>{account.name}</h4><small>{account.kind}{account.purpose ? ` • ${account.purpose}` : ""}</small></div><strong>{money(balances[account.id] ?? 0)}</strong><label>Saldo inicial<input type="number" step="0.01" value={account.balance} onChange={(event) => store.updateAccount(account.id, Number(event.target.value) || 0)} /></label><ConfirmButton ariaLabel={`Excluir ${account.name}`} onConfirm={() => store.removeAccount(account.id)} /></article>)}</div>
      <form className="finance-account-form finance-account-form-wide" onSubmit={(event) => { event.preventDefault(); if (!accountName.trim()) return; store.addAccount({ id: crypto.randomUUID(), name: accountName.trim(), kind: accountKind.trim(), balance: 0, role: accountRole, purpose: accountPurpose.trim() || undefined }); setAccountName(""); setAccountPurpose(""); }}><input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Nome da conta" /><select value={accountRole} onChange={(event) => setAccountRole(event.target.value as "available" | "investment")}><option value="available">Dinheiro disponível</option><option value="investment">Investimento</option></select><input value={accountKind} onChange={(event) => setAccountKind(event.target.value)} placeholder="Tipo da conta" />{accountRole === "investment" && <input value={accountPurpose} onChange={(event) => setAccountPurpose(event.target.value)} placeholder="Finalidade: reserva, viagem..." />}<button>Adicionar conta</button></form>
    </div>

    <div className="finance-columns"><div className="finance-section"><h3>Movimentações de {month.split("-").reverse().join("/")}</h3>{visibleMonthEntries.length ? <div className="finance-entry-list">{visibleMonthEntries.map((entry) => <EntryRow key={entry.id} entry={entry} month={month} accounts={accounts} onPay={() => store.toggleEntryMonth(entry.id, month)} onRemove={() => store.removeEntry(entry.id)} />)}</div> : <Empty text={monthEntries.length ? "Nenhuma movimentação encontrada." : "Nenhuma movimentação neste mês."} />}</div>
      <div className="finance-section"><h3>Compromissos</h3>{visibleCommitments.length || visibleBills.length ? <div className="finance-entry-list">{visibleCommitments.map((entry) => <EntryRow key={entry.id} entry={entry} month={month} accounts={accounts} onPay={() => store.toggleEntryMonth(entry.id, month)} onRemove={() => store.removeEntry(entry.id)} />)}{visibleBills.map((bill) => <article key={bill.id}><div><strong>{bill.title}</strong><span>Conta • vence {formatDate(bill.dueDate)}</span></div><strong>{money(bill.amount)}</strong><div><button onClick={() => store.toggleBill(bill.id)}>Marcar paga</button></div></article>)}</div> : <Empty text={(commitments.length || unpaidBills.length) ? "Nenhum compromisso encontrado." : "Nenhum valor pendente."} />}</div></div>
  </section>;
}

function EntryRow({ entry, month, accounts, onPay, onRemove }: { entry: FinanceEntry; month: string; accounts: InvestmentAccount[]; onPay: () => void; onRemove: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const from = accounts.find((account) => account.id === entry.fromAccountId)?.name;
  const to = accounts.find((account) => account.id === entry.toAccountId)?.name;
  const paid = (entry.settledMonths ?? []).includes(month) || entry.settled;
  return <article><div><strong>{entry.title}</strong><span>{entry.type === "income" ? `Entrada em ${to ?? "conta"}` : entry.type === "transfer" ? `${from ?? "Conta"} → ${to ?? "Conta"}` : `${methodLabels[entry.method ?? "pix"]} • ${from ?? "conta"}`}{entry.recurring ? " • Recorrente" : ""}{(entry.installments ?? 1) > 1 ? ` • Parcela ${monthDistance(entry.date.slice(0, 7), month) + 1}/${entry.installments}` : ""}</span></div><strong className={`finance-value ${entry.type}`}>{entry.type === "income" ? "+" : entry.type === "transfer" ? "" : "−"}{money(entry.amount)}</strong><div>{entry.type === "expense" && entry.method === "credit" && <button onClick={onPay}>{paid ? "Reabrir parcela" : "Marcar parcela paga"}</button>}{confirmDelete ? <><button className="danger-action" onClick={onRemove}>Confirmar exclusão</button><button onClick={() => setConfirmDelete(false)}>Cancelar</button></> : <button onClick={() => setConfirmDelete(true)}>Excluir</button>}</div></article>;
}
function FinanceCard({ label, value, emphasis = false, detail }: { label: string; value: number; emphasis?: boolean; detail?: string }) { return <article className={emphasis ? "emphasis" : ""}><span>{label}</span><strong>{money(value)}</strong>{detail && <small>{detail}</small>}</article>; }
function accountOption(account: InvestmentAccount) { return <option key={account.id} value={account.id}>{account.name}</option>; }
function Empty({ text }: { text: string }) { return <div className="finance-empty">{text}</div>; }
function appliesToMonth(entry: FinanceEntry, month: string) { const distance = monthDistance(entry.date.slice(0, 7), month); if (distance < 0) return false; if ((entry.installments ?? 1) > 1) return distance < (entry.installments ?? 1); return distance === 0 || Boolean(entry.recurring); }
function monthDistance(start: string, target: string) { const [sy, sm] = start.split("-").map(Number); const [ty, tm] = target.split("-").map(Number); return (ty - sy) * 12 + tm - sm; }
function formatDate(value: string) { return value.split("-").reverse().join("/"); }

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
function MonthYearPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(Number(value.slice(0, 4)));
  const selectedMonth = Number(value.slice(5, 7)) - 1;
  return <div className="month-picker"><button type="button" className="month-picker-trigger" onClick={() => { setYear(Number(value.slice(0, 4))); setOpen(!open); }}>{monthNames[selectedMonth]} de {value.slice(0, 4)} <span>▾</span></button>{open && <div className="month-picker-popover"><header><button type="button" onClick={() => setYear((current) => current - 1)}>‹</button><strong>{year}</strong><button type="button" onClick={() => setYear((current) => current + 1)}>›</button></header><div>{monthNames.map((name, index) => <button type="button" key={name} className={year === Number(value.slice(0, 4)) && index === selectedMonth ? "active" : ""} onClick={() => { onChange(`${year}-${String(index + 1).padStart(2, "0")}`); setOpen(false); }}>{name.slice(0, 3)}</button>)}</div><button type="button" className="month-picker-today" onClick={() => { onChange(localDate().slice(0, 7)); setOpen(false); }}>Mês atual</button></div>}</div>;
}
