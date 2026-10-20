import { Link } from "react-router-dom";
import { useSiteStore } from "../stores/useSiteStore";
import { useState } from "react";
import { OrganizedList } from "../components/ListOrganization";
import { useTaskStore } from "../stores/useTaskStore"; import { useRecordStore } from "../stores/useRecordStore"; import { useEventStore } from "../stores/useEventStore"; import { useInventoryStore } from "../stores/useInventoryStore";
export function SearchPage() {
  const [query, setQuery] = useState(""); const q = query.trim().toLocaleLowerCase("pt-BR");
  const tasks = useTaskStore((state) => state.tasks); const projects = useRecordStore((state) => state.records); const events = useEventStore((state) => state.events); const inventory = useInventoryStore((state) => state.inventory);
  const sites = useSiteStore((state) => state.sites);
  const results: { id: string; type: string; title: string; url?: string }[] = q ? [
    ...sites.filter((site) => `${site.name} ${site.address} ${site.contact} ${site.notes} ${site.infoTabs.map((tab) => `${tab.title} ${tab.content}`).join(" ")} ${site.lists.map((list) => `${list.title} ${list.items.map((item) => item.text).join(" ")}`).join(" ")} ${site.materials.map((material) => `${material.name} ${material.notes}`).join(" ")}`.toLocaleLowerCase("pt-BR").includes(q)).map((site) => ({ id: "site:" + site.id, type: "Site", title: site.name, url: `/sites?site=${site.id}` })),
    ...tasks.filter((item) => item.title.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ id: "task:" + item.id, url: "/tasks", type: "Tarefa", title: item.title })),
    ...projects.filter((item) => `${item.title} ${item.details}`.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ id: "record:" + item.id, url: `/${item.area}`, type: "Projeto", title: item.title })),
    ...events.filter((item) => item.title.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ id: "event:" + item.id, url: "/calendar", type: "Data", title: item.title })),
    ...inventory.filter((item) => `${item.product} ${item.brand}`.toLocaleLowerCase("pt-BR").includes(q)).map((item) => ({ id: "inventory:" + item.id, url: "/inventory", type: "Estoque", title: `${item.product} • ${item.brand}` })),
  ] : [];
  return <section><header className="page-header"><div><h2>Busca geral</h2><p>Encontre tarefas, projetos, sites, datas e materiais.</p></div></header><div className="search-box"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você procura?" autoFocus /></div>{q && results.length === 0 && <p>Nenhum resultado.</p>}{q && <OrganizedList collection="tasks:search-results" items={results} label={(result) => result.title} name="resultados" className="simple-list">{(result) => <article><span className="record-category">{result.type}</span><strong>{result.url ? <Link to={result.url}>{result.title}</Link> : result.title}</strong></article>}</OrganizedList>}</section>;
}
