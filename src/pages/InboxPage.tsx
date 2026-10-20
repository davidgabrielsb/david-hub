import { useState } from "react";
import { useInboxStore } from "../stores/useInboxStore";
import { useTaskStore, type TaskArea } from "../stores/useTaskStore";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";

export function InboxPage() {
  const items = useInboxStore((state) => state.items);
  const addItem = useInboxStore((state) => state.addItem);
  const removeItem = useInboxStore((state) => state.removeItem);
  const addTask = useTaskStore((state) => state.addTask);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [area, setArea] = useState<TaskArea>("work");
  const visibleItems = items.filter((item) => item.text.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  return <section><header className="page-header"><div><h2>Caixa de entrada</h2><p>Anote rápido agora e organize depois.</p></div><PageSearch value={search} onChange={setSearch} placeholder="Buscar anotação..." /></header>
    <form className="quick-form" onSubmit={(event) => { event.preventDefault(); if (!text.trim()) return; addItem(text.trim()); setText(""); }}>
      <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Digite qualquer coisa que surgiu..." autoFocus />
      <button type="submit">Capturar</button>
    </form>
    <div className="quick-toolbar"><label>Ao transformar em tarefa: <select value={area} onChange={(event) => setArea(event.target.value as TaskArea)}><option value="work">Trabalho</option><option value="study">Estudos</option><option value="personal">Pessoal</option></select></label></div>
    <div className="simple-list">{visibleItems.length === 0 ? <p>{items.length ? "Nenhuma anotação encontrada." : "Caixa de entrada vazia."}</p> : visibleItems.map((item) => <article key={item.id}><strong>{item.text}</strong><div>
      <button onClick={() => { addTask({ id: crypto.randomUUID(), title: item.text, area, priority: "normal", status: "todo", createdAt: new Date().toISOString() }); removeItem(item.id); }}>Virar tarefa</button>
      <ConfirmButton label="Descartar" confirmLabel="Confirmar descarte" onConfirm={() => removeItem(item.id)} /></div></article>)}</div>
  </section>;
}
