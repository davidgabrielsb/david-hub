import { useState } from "react";
import { useTaskStore } from "../stores/useTaskStore"; import { useRecordStore } from "../stores/useRecordStore"; import { useEventStore } from "../stores/useEventStore"; import { useInventoryStore } from "../stores/useInventoryStore";
export function SearchPage() {
  const [query, setQuery] = useState(""); const q = query.trim().toLocaleLowerCase("pt-BR");
  const tasks = useTaskStore((state) => state.tasks); const projects = useRecordStore((state) => state.records); const events = useEventStore((state) => state.events); const inventory = useInventoryStore((state) => state.inventory);
  const results = q ? [
    ...tasks.filter((item) => item.title.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ type: "Tarefa", title: item.title })),
    ...projects.filter((item) => `${item.title} ${item.details}`.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ type: "Projeto", title: item.title })),
    ...events.filter((item) => item.title.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ type: "Data", title: item.title })),
    ...inventory.filter((item) => `${item.product} ${item.brand}`.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ type: "Estoque", title: `${item.product} • ${item.brand}` })),
  ] : [];
  return <section><header className="page-header"><div><h2>Busca geral</h2><p>Encontre tarefas, projetos, datas e materiais.</p></div></header><div className="search-box"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você procura?" autoFocus /></div><div className="simple-list">{q && results.length === 0 ? <p>Nenhum resultado.</p> : results.map((result, index) => <article key={`${result.type}-${index}`}><span className="record-category">{result.type}</span><strong>{result.title}</strong></article>)}</div></section>;
}
