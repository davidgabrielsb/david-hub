import { Link } from "react-router-dom";
import { useSiteStore } from "../stores/useSiteStore";
import { useState } from "react";
import { useTaskStore } from "../stores/useTaskStore"; import { useRecordStore } from "../stores/useRecordStore"; import { useEventStore } from "../stores/useEventStore"; import { useInventoryStore } from "../stores/useInventoryStore";
export function SearchPage() {
  const [query, setQuery] = useState(""); const q = query.trim().toLocaleLowerCase("pt-BR");
  const tasks = useTaskStore((state) => state.tasks); const projects = useRecordStore((state) => state.records); const events = useEventStore((state) => state.events); const inventory = useInventoryStore((state) => state.inventory);
  const sites = useSiteStore((state) => state.sites);
  const results: { type: string; title: string; url?: string }[] = q ? [
    ...sites.filter((site) => `${site.name} ${site.address} ${site.contact} ${site.notes} ${site.infoTabs.map((tab) => `${tab.title} ${tab.content}`).join(" ")} ${site.lists.map((list) => `${list.title} ${list.items.map((item) => item.text).join(" ")}`).join(" ")} ${site.materials.map((material) => `${material.name} ${material.notes}`).join(" ")}`.toLocaleLowerCase("pt-BR").includes(q)).map((site) => ({ type: "Site", title: site.name, url: `/sites?site=${site.id}` })),
    ...tasks.filter((item) => item.title.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ type: "Tarefa", title: item.title })),
    ...projects.filter((item) => `${item.title} ${item.details}`.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ type: "Projeto", title: item.title })),
    ...events.filter((item) => item.title.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ type: "Data", title: item.title })),
    ...inventory.filter((item) => `${item.product} ${item.brand}`.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ type: "Estoque", title: `${item.product} • ${item.brand}` })),
  ] : [];
  return <section><header className="page-header"><div><h2>Busca geral</h2><p>Encontre tarefas, projetos, sites, datas e materiais.</p></div></header><div className="search-box"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você procura?" autoFocus /></div><div className="simple-list">{q && results.length === 0 ? <p>Nenhum resultado.</p> : results.map((result, index) => <article key={`${result.type}-${index}`}><span className="record-category">{result.type}</span><strong>{result.url ? <Link to={result.url}>{result.title}</Link> : result.title}</strong></article>)}</div></section>;
}
