import { isCloudConfigured } from "../lib/supabase/client";
import { useCloudStatusStore } from "../stores/useCloudStatusStore";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { OrganizedList } from "../components/ListOrganization";
import { EntityEditor } from "../components/EntityEditor";
import { HubDialog } from "../components/HubDialog";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";
import { useRecordStore } from "../stores/useRecordStore";
import { useSiteStore, type HubSite, type SiteInfoTab, type SiteList, type SiteMaterial, type MaterialStatus } from "../stores/useSiteStore";

const statusLabels: Record<MaterialStatus, string> = { pending: "Pendente", ordered: "Solicitado", received: "Recebido" };
type Section = "overview" | "information" | "lists" | "materials";
export function SitesPage() {
  const sites = useSiteStore((state) => state.sites);
  const sitesReady = useCloudStatusStore((state) => state.sitesReady);
  const projects = useRecordStore((state) => state.records);
  const [params, setParams] = useSearchParams();
  const selected = sites.find((site) => site.id === params.get("site"));
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const query = search.trim().toLocaleLowerCase("pt-BR");
  const visible = sites.filter((site) => (!projectFilter || site.projectIds.includes(projectFilter)) && `${site.name} ${site.address} ${site.contact} ${site.notes} ${site.infoTabs.map((tab) => `${tab.title} ${tab.content}`).join(" ")} ${site.lists.map((list) => `${list.title} ${list.items.map((item) => item.text).join(" ")}`).join(" ")} ${site.materials.map((material) => `${material.name} ${material.notes}`).join(" ")} ${projects.filter((project) => site.projectIds.includes(project.id)).map((project) => project.title).join(" ")}`.toLocaleLowerCase("pt-BR").includes(query));
  return <section className="sites-page">
    <header className="page-header"><div><h2>Sites</h2><p>Informações, listas e materiais de cada local, conectados aos seus projetos.</p></div><button type="button" className="sites-primary" onClick={() => setCreating(true)}>+ Novo site</button></header>
    {isCloudConfigured && sitesReady === false && <p className="site-sync-notice" role="status">Os sites estão salvos neste computador. A sincronização desta nova área ainda precisa ser habilitada; faça um backup antes de mudar de dispositivo.</p>}
    {selected ? <><button className="sites-back" type="button" onClick={() => setParams({})}>← Todos os sites</button><SiteDetail key={selected.id} site={selected} onRemove={() => setParams({})} /></> : <>
      <div className="sites-toolbar"><PageSearch value={search} onChange={setSearch} placeholder="Buscar site, informação ou material..." /><label>Projeto<select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="">Todos os projetos</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label><span>{visible.length} {visible.length === 1 ? "site" : "sites"}</span></div>
      <OrganizedList collection="sites:items" items={visible} label={(site) => site.name} name="sites" className="sites-grid">{(site) => {
        const pending = site.materials.filter((material) => material.status !== "received").length;
        const items = site.lists.flatMap((list) => list.items);
        return <article className="site-card" key={site.id}><span className="record-category">{site.projectIds.filter((id) => projects.some((project) => project.id === id)).length} projeto(s) associado(s)</span><h3><Link to={`/sites?site=${site.id}`}>{site.name}</Link></h3><p>{site.address || "Endereço não informado"}</p>{site.contact && <small>{site.contact}</small>}<div className="site-card-stats"><span>{site.infoTabs.length} abas de informações</span><span>{items.filter((item) => item.done).length}/{items.length} itens concluídos</span><span className={pending ? "site-pending" : ""}>{pending} materiais pendentes</span></div><Link className="site-open" to={`/sites?site=${site.id}`}>Abrir site →</Link></article>;
      }}</OrganizedList>
      {visible.length === 0 && <div className="empty-state"><strong>{sites.length ? "Nenhum site encontrado." : "Seus sites começam aqui."}</strong><p>{sites.length ? "Ajuste a busca ou o filtro de projetos." : "Cadastre um local e reúna informações, listas e materiais em um só lugar."}</p></div>}
    </>}
    {creating && <SiteEditor onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setParams({ site: id }); }} />}
  </section>;
}
function SiteEditor({ site, onClose, onCreated }: { site?: HubSite; onClose: () => void; onCreated?: (id: string) => void }) {
  const [name, setName] = useState(site?.name ?? "");
  const [address, setAddress] = useState(site?.address ?? "");
  const [contact, setContact] = useState(site?.contact ?? "");
  const [notes, setNotes] = useState(site?.notes ?? "");
  const [projectIds, setProjectIds] = useState(site?.projectIds ?? []);
  const projects = useRecordStore((state) => state.records);
  const store = useSiteStore();
  return <HubDialog title={site ? "Editar site" : "Novo site"} onClose={onClose}><form onSubmit={(event) => {
    event.preventDefault(); if (!name.trim()) return;
    const values = { name: name.trim(), address: address.trim(), contact: contact.trim(), notes: notes.trim(), projectIds: projectIds.filter((id) => projects.some((project) => project.id === id)) };
    if (site) { store.updateSite(site.id, values); onClose(); } else { onCreated?.(store.addSite(values)); }
  }}><label>Nome do site<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Estação Centro" /></label><label>Endereço<input value={address} onChange={(event) => setAddress(event.target.value)} /></label><label>Contato ou responsável<input value={contact} onChange={(event) => setContact(event.target.value)} /></label><label>Informações gerais<textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><fieldset><legend>Projetos associados</legend>{projects.length ? projects.map((project) => <label className="site-checkbox" key={project.id}><input type="checkbox" checked={projectIds.includes(project.id)} onChange={(event) => setProjectIds(event.target.checked ? [...projectIds, project.id] : projectIds.filter((id) => id !== project.id))} />{project.title}</label>) : <p>Crie um projeto em Trabalho, Estudos ou Vida pessoal para associá-lo.</p>}</fieldset><footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit">{site ? "Salvar alterações" : "Criar site"}</button></footer></form></HubDialog>;
}
function SiteDetail({ site, onRemove }: { site: HubSite; onRemove: () => void }) {
  const [section, setSection] = useState<Section>("overview");
  const [editing, setEditing] = useState(false);
  const [tabTitle, setTabTitle] = useState("");
  const [listTitle, setListTitle] = useState("");
  const [activeInfoId, setActiveInfoId] = useState("");
  const [materialFilter, setMaterialFilter] = useState("open");
  const [materialEditor, setMaterialEditor] = useState<SiteMaterial | "new" | null>(null);
  const projects = useRecordStore((state) => state.records).filter((project) => site.projectIds.includes(project.id));
  const store = useSiteStore();
  const activeInfo = site.infoTabs.find((tab) => tab.id === activeInfoId) ?? site.infoTabs[0];
  const pendingMaterials = site.materials.filter((material) => material.status !== "received");
  const materialList = site.materials.filter((material) => materialFilter === "all" || (materialFilter === "open" ? material.status !== "received" : material.status === "received"));
  const sections: [Section, string][] = [["overview", "Visão geral"], ["information", "Informações"], ["lists", `Listas (${site.lists.length})`], ["materials", `Materiais (${pendingMaterials.length})`]];
  return <div className="site-detail"><header className="site-detail-header"><div><h3>{site.name}</h3><p>{site.address || "Endereço não informado"}</p></div><div><button type="button" onClick={() => setEditing(true)}>Editar site</button><ConfirmButton label="Excluir site" ariaLabel={`Excluir site ${site.name}`} onConfirm={() => { store.removeSite(site.id); onRemove(); }} /></div></header>
    <div className="records-tabs" role="tablist" aria-label="Conteúdo do site">{sections.map(([key, label]) => <button key={key} id={`site-tab-${key}`} role="tab" aria-selected={section === key} aria-controls="site-content" className={section === key ? "active" : ""} onClick={() => setSection(key)}>{label}</button>)}</div>
    <div id="site-content" role="tabpanel" aria-labelledby={`site-tab-${section}`}>
    {section === "overview" && <div className="site-overview"><article className="site-panel"><h4>Informações gerais</h4><p className="site-prewrap">{site.notes || "Adicione informações gerais em Editar site."}</p><h4>Contato ou responsável</h4><p>{site.contact || "Não informado"}</p><h4>Projetos associados</h4>{projects.length ? <div className="site-project-links">{projects.map((project) => <Link key={project.id} to={`/${project.area === "personal" ? "personal" : project.area}`}>{project.title}</Link>)}</div> : <p>Nenhum projeto associado.</p>}</article><article className="site-panel"><h4>Resumo do site</h4><p>{site.infoTabs.length} abas de informações</p><p>{site.lists.flatMap((list) => list.items).filter((item) => !item.done).length} itens de listas em aberto</p><p>{pendingMaterials.length} materiais aguardando recebimento</p><button type="button" onClick={() => setSection("materials")}>Ver pendências de materiais</button></article></div>}
    {section === "information" && <><form className="site-inline-form" onSubmit={(event) => { event.preventDefault(); const id = store.addInfoTab(site.id, tabTitle); if (id) setActiveInfoId(id); setTabTitle(""); }}><label>Nova aba de informações<input required value={tabTitle} onChange={(event) => setTabTitle(event.target.value)} placeholder="Ex.: Acessos, dados técnicos, visitas..." /></label><button type="submit">Adicionar aba</button></form>{site.infoTabs.length ? <><OrganizedList collection={`sites:tabs:${site.id}`} items={site.infoTabs} label={(tab) => tab.title} name="abas" className="site-info-tabs">{(tab) => <button type="button" className={tab.id === activeInfo?.id ? "active-action" : ""} key={tab.id} onClick={() => setActiveInfoId(tab.id)}>{tab.title}</button>}</OrganizedList>{activeInfo && <InfoEditor key={activeInfo.id} siteId={site.id} tab={activeInfo} />}</> : <p className="site-empty">Crie abas para separar as informações deste local.</p>}</>}
    {section === "lists" && <><form className="site-inline-form" onSubmit={(event) => { event.preventDefault(); store.addList(site.id, listTitle); setListTitle(""); }}><label>Nome da nova lista<input required value={listTitle} onChange={(event) => setListTitle(event.target.value)} placeholder="Ex.: Visita técnica" /></label><button type="submit">Criar lista</button></form><OrganizedList collection={`sites:lists:${site.id}`} items={site.lists} label={(list) => list.title} name="listas" className="sites-grid">{(list) => <ListCard siteId={site.id} list={list} />}</OrganizedList>{site.lists.length === 0 && <p className="site-empty">Crie listas para organizar as atividades deste site.</p>}</>}
    {section === "materials" && <><div className="sites-toolbar"><label>Mostrar<select value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)}><option value="open">Pendentes e solicitados</option><option value="received">Recebidos</option><option value="all">Todos os materiais</option></select></label><button type="button" onClick={() => setMaterialEditor("new")}>+ Adicionar material</button></div><OrganizedList collection={`sites:materials:${site.id}`} items={materialList} label={(material) => material.name} name="materiais" className="site-material-list">{(material) => <article className="site-material" key={material.id}><div><strong>{material.name}</strong><p>{material.quantity.toLocaleString("pt-BR")} {material.unit} • <span className={material.status === "received" ? "" : "site-pending"}>{statusLabels[material.status]}</span></p>{material.notes && <p className="site-prewrap">{material.notes}</p>}</div><div><select aria-label={`Situação de ${material.name}`} value={material.status} onChange={(event) => store.updateMaterial(site.id, material.id, { ...material, status: event.target.value as MaterialStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={() => setMaterialEditor(material)}>Editar</button><ConfirmButton ariaLabel={`Excluir material ${material.name}`} onConfirm={() => store.removeMaterial(site.id, material.id)} /></div></article>}</OrganizedList>{materialList.length === 0 && <p className="site-empty">Nenhum material nesta lista.</p>}</>}
    </div>
    {editing && <SiteEditor site={site} onClose={() => setEditing(false)} />}
    {materialEditor && <MaterialEditor siteId={site.id} material={materialEditor === "new" ? undefined : materialEditor} onClose={() => setMaterialEditor(null)} />}
  </div>;
}
function InfoEditor({ siteId, tab }: { siteId: string; tab: SiteInfoTab }) {
  const store = useSiteStore();
  const [editing, setEditing] = useState(false);
  return <article className="site-panel"><h4>{tab.title}</h4><p className="site-prewrap">{tab.content || "Nenhuma informação registrada."}</p><button type="button" onClick={() => setEditing(true)}>Editar informações</button><ConfirmButton label="Excluir aba" ariaLabel={`Excluir aba ${tab.title}`} onConfirm={() => store.removeInfoTab(siteId, tab.id)} />
    {editing && <EntityEditor title="Editar informações" initial={{ title: tab.title, content: tab.content }} fields={[{ name: "title", label: "Nome da aba", required: true }, { name: "content", label: "Conteúdo", type: "textarea" }]} onSave={(values) => store.updateInfoTab(siteId, tab.id, { title: values.title, content: values.content })} onClose={() => setEditing(false)} />}
  </article>;
}
function ListCard({ siteId, list }: { siteId: string; list: SiteList }) {
  const store = useSiteStore();
  const [text, setText] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; text: string } | null>(null);
  return <article className="site-panel site-list"><header><h4>{list.title}</h4><small>{list.items.filter((item) => item.done).length}/{list.items.length} concluídos</small></header>
    <OrganizedList collection={"sites:list-items:" + siteId + ":" + list.id} items={list.items} label={(item) => item.text} name="itens" className="site-list-items">{(item) => <div className="project-task-row"><label className="site-checkbox"><input type="checkbox" checked={item.done} onChange={(event) => store.updateListItem(siteId, list.id, item.id, { done: event.target.checked })} /><span className={item.done ? "project-task-done" : ""}>{item.text}</span></label><button type="button" onClick={() => setEditingItem(item)}>Editar</button><ConfirmButton ariaLabel={"Excluir item " + item.text} onConfirm={() => store.removeListItem(siteId, list.id, item.id)} /></div>}</OrganizedList>
    <form className="site-inline-form" onSubmit={(event) => { event.preventDefault(); store.addListItem(siteId, list.id, text); setText(""); }}><input required aria-label={"Novo item de " + list.title} value={text} onChange={(event) => setText(event.target.value)} placeholder="Adicionar item..." /><button>Adicionar item</button></form>
    <footer><button type="button" onClick={() => setEditingTitle(true)}>Editar lista</button><ConfirmButton label="Excluir lista" ariaLabel={"Excluir lista " + list.title} onConfirm={() => store.removeList(siteId, list.id)} /></footer>
    {editingTitle && <EntityEditor title="Editar lista" initial={{ title: list.title }} fields={[{ name: "title", label: "Nome da lista", required: true }]} onSave={(values) => store.updateList(siteId, list.id, values.title)} onClose={() => setEditingTitle(false)} />}
    {editingItem && <EntityEditor key={editingItem.id} title="Editar item" initial={{ text: editingItem.text }} fields={[{ name: "text", label: "Texto do item", type: "textarea", required: true }]} onSave={(values) => store.updateListItem(siteId, list.id, editingItem.id, { text: values.text })} onClose={() => setEditingItem(null)} />}
  </article>;
}
function MaterialEditor({ siteId, material, onClose }: { siteId: string; material?: SiteMaterial; onClose: () => void }) {
  const store = useSiteStore();
  const [name, setName] = useState(material?.name ?? "");
  const [quantity, setQuantity] = useState(String(material?.quantity ?? 1));
  const [unit, setUnit] = useState(material?.unit ?? "un");
  const [status, setStatus] = useState<MaterialStatus>(material?.status ?? "pending");
  const [notes, setNotes] = useState(material?.notes ?? "");
  return <HubDialog title={material ? "Editar material" : "Adicionar material"} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); const value = Number(quantity); if (!name.trim() || !Number.isFinite(value) || value <= 0) return; const values = { name: name.trim(), quantity: value, unit: unit.trim() || "un", status, notes: notes.trim() }; if (material) store.updateMaterial(siteId, material.id, values); else store.addMaterial(siteId, values); onClose(); }}><label>Material<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Quantidade<input type="number" min="0.001" step="any" required value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><label>Unidade<input required value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="un, m, kg..." /></label><label>Situação<select value={status} onChange={(event) => setStatus(event.target.value as MaterialStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Observações<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Especificação, fornecedor, previsão..." /></label><footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit">Salvar material</button></footer></form></HubDialog>;
}
