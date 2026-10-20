import { EntityEditor } from "./EntityEditor";
import { useFinanceStore, type Bill, type FinanceEntry, type InvestmentAccount, type PaymentMethod } from "../stores/useFinanceStore";

export function AccountEditor({ account, onClose }: { account: InvestmentAccount; onClose: () => void }) {
  const editAccount = useFinanceStore((state) => state.editAccount);
  return <EntityEditor title="Editar conta" initial={{ ...account, role: account.role ?? "available" }} fields={[
    { name: "name", label: "Nome da conta", required: true }, { name: "kind", label: "Tipo da conta", required: true },
    { name: "role", label: "Categoria", type: "select", options: [{ value: "available", label: "Dinheiro disponível" }, { value: "investment", label: "Investimento" }] },
    { name: "balance", label: "Saldo inicial (R$)", type: "number", step: "0.01", required: true }, { name: "purpose", label: "Finalidade" },
  ]} validate={(values) => Number.isFinite(Number(values.balance)) ? undefined : "Informe um saldo válido."} onSave={(values) => editAccount(account.id, { name: values.name, kind: values.kind, role: values.role as InvestmentAccount["role"], balance: Number(values.balance), purpose: values.purpose || undefined })} onClose={onClose} />;
}

export function EntryEditor({ entry, onClose }: { entry: FinanceEntry; onClose: () => void }) {
  const accounts = useFinanceStore((state) => state.accounts);
  const updateEntry = useFinanceStore((state) => state.updateEntry);
  const options = [{ value: "", label: "Sem conta" }, ...accounts.map((account) => ({ value: account.id, label: account.name }))];
  return <EntityEditor title="Editar movimentação" initial={{ ...entry, method: entry.method ?? "pix", installments: entry.installments ?? 1, recurring: entry.recurring ?? false }} fields={[
    { name: "title", label: "Descrição", required: true },
    { name: "type", label: "Tipo", type: "select", options: [{ value: "income", label: "Entrada" }, { value: "expense", label: "Saída" }, { value: "transfer", label: "Transferência" }, ...(entry.type === "saving" || entry.type === "investment" ? [{ value: entry.type, label: "Investimento (registro anterior)" }] : [])] },
    { name: "amount", label: "Valor (R$)", type: "number", min: .01, step: "0.01", required: true }, { name: "date", label: "Data", type: "date", required: true },
    { name: "category", label: "Categoria" }, { name: "fromAccountId", label: "Conta de origem (saída / transferência)", type: "select", options }, { name: "toAccountId", label: "Conta de destino (entrada / transferência)", type: "select", options },
    { name: "method", label: "Forma de pagamento (saídas)", type: "select", options: [{ value: "pix", label: "Pix" }, { value: "debit", label: "Débito" }, { value: "credit", label: "Crédito" }, { value: "cash", label: "Dinheiro" }, { value: "transfer", label: "Transferência" }] },
    { name: "dueDate", label: "Vencimento", type: "date" }, { name: "installments", label: "Parcelas", type: "number", min: 1, step: "1", required: true }, { name: "recurring", label: "Repetir todos os meses", type: "checkbox" },
  ]} validate={(values) => {
    if (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0) return "Informe um valor maior que zero.";
    if (values.type === "income" && !accounts.some((account) => account.id === values.toAccountId)) return "Escolha a conta de destino.";
    if ((values.type === "expense" || values.type === "transfer") && !accounts.some((account) => account.id === values.fromAccountId)) return "Escolha a conta de origem.";
    if (values.type === "transfer" && (!accounts.some((account) => account.id === values.toAccountId) || values.toAccountId === values.fromAccountId)) return "Escolha uma conta de destino diferente da origem.";
    if (Number(values.installments) > 1 && values.recurring === "true") return "Escolha parcelamento ou repetição mensal.";
    return undefined;
  }} onSave={(values) => updateEntry(entry.id, { title: values.title, type: values.type as FinanceEntry["type"], amount: Number(values.amount), date: values.date, category: values.category || "Geral", fromAccountId: values.type === "income" ? undefined : values.fromAccountId || undefined, toAccountId: values.type === "expense" ? undefined : values.toAccountId || undefined, method: values.type === "transfer" ? "transfer" : values.type === "expense" ? values.method as PaymentMethod : undefined, dueDate: values.dueDate || undefined, installments: Number(values.installments), recurring: values.type !== "transfer" && values.recurring === "true" })} onClose={onClose} />;
}

export function BillEditor({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const updateBill = useFinanceStore((state) => state.updateBill);
  return <EntityEditor title="Editar conta a pagar" initial={{ ...bill }} fields={[{ name: "title", label: "Descrição", required: true }, { name: "amount", label: "Valor (R$)", type: "number", min: .01, step: "0.01", required: true }, { name: "dueDate", label: "Vencimento", type: "date", required: true }]} onSave={(values) => updateBill(bill.id, { title: values.title, amount: Number(values.amount), dueDate: values.dueDate })} onClose={onClose} />;
}
