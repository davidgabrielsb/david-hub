import { useState } from "react";
import { useInboxStore } from "../../stores/useInboxStore";
import { useTaskStore, type TaskArea } from "../../stores/useTaskStore";
import { useEventStore } from "../../stores/useEventStore";
import { useFinanceStore } from "../../stores/useFinanceStore";
import { useRecordStore } from "../../stores/useRecordStore";
type QuickKind = "inbox" | "task" | "event" | "bill" | "project";
export function QuickAdd() {
  const [open, setOpen] = useState(false); const [text, setText] = useState(""); const [kind, setKind] = useState<QuickKind>("inbox"); const [area, setArea] = useState<TaskArea>("work"); const [date, setDate] = useState(""); const [amount, setAmount] = useState("");
  const addInbox = useInboxStore((state) => state.addItem); const addTask = useTaskStore((state) => state.addTask); const addEvent = useEventStore((state) => state.addEvent); const addBill = useFinanceStore((state) => state.addBill); const addProject = useRecordStore((state) => state.addRecord);
  function close() { setOpen(false); setText(""); setDate(""); setAmount(""); }
  function submit(event: React.FormEvent) {
    event.preventDefault(); if (!text.trim()) return;
    if (kind === "inbox") addInbox(text.trim());
    if (kind === "task") addTask({ id: crypto.randomUUID(), title: text.trim(), area, priority: "normal", status: "todo", deadline: date || undefined, createdAt: new Date().toISOString() });
    if (kind === "event" && date) addEvent({ id: crypto.randomUUID(), title: text.trim(), area, date });
    if (kind === "bill" && date && Number(amount) > 0) addBill({ id: crypto.randomUUID(), title: text.trim(), amount: Number(amount), dueDate: date, paid: false });
    if (kind === "project") addProject({ id: crypto.randomUUID(), title: text.trim(), area, category: "Lista avulsa", details: "", dueDate: date || undefined, completed: false, createdAt: new Date().toISOString() });
    close();
  }
  const needsDate = kind === "task" || kind === "event" || kind === "bill" || kind === "project";
  return <><button className="global-add" onClick={() => setOpen(true)}>+ Adicionar</button>{open && <div className="modal-backdrop" onMouseDown={close}><div className="quick-modal" onMouseDown={(event) => event.stopPropagation()}><header><h3>Adicionar rapidamente</h3><button onClick={close}>×</button></header><form onSubmit={submit}>
    <select value={kind} onChange={(event) => setKind(event.target.value as QuickKind)}><option value="inbox">Caixa de entrada</option><option value="task">Tarefa</option><option value="project">Projeto</option><option value="event">Compromisso</option><option value="bill">Conta</option></select>
    {(kind === "task" || kind === "project" || kind === "event") && <select value={area} onChange={(event) => setArea(event.target.value as TaskArea)}><option value="work">Trabalho</option><option value="study">Estudos</option><option value="personal">Pessoal</option></select>}
    <input autoFocus value={text} onChange={(event) => setText(event.target.value)} placeholder={kind === "project" ? "Nome do projeto" : kind === "bill" ? "Nome da conta" : "O que surgiu?"} />
    {needsDate && <input type="date" required={kind === "event" || kind === "bill"} value={date} onChange={(event) => setDate(event.target.value)} />}{kind === "bill" && <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Valor" required />}
    <button type="submit">Salvar</button></form></div></div>}</>;
}
