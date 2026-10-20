import { Link } from "react-router-dom";
import { useSiteStore } from "../stores/useSiteStore";
import { useState } from "react";
import { useRecordStore, type HubRecord, type RecordArea } from "../stores/useRecordStore";
import { useTaskStore, type TaskPriority } from "../stores/useTaskStore";
import { getProjectProgress } from "../features/projects/progress";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";

const settings = {
  work: {
    title: "Trabalho",
    categories: ["Projeto elétrico", "Cliente e comunicação", "Ocorrência", "Obra", "Estação de recarga", "Aplicativo CPO", "Cadastro de carregador", "Relatório de energia", "Lista avulsa"],
  },
  study: {
    title: "Estudos",
    categories: ["Prova", "Trabalho", "Conteúdo", "TCC", "Lista avulsa"],
  },
  personal: {
    title: "Hábitos e vida pessoal",
    categories: ["Hábito", "Documento", "Meta", "Lista", "Casa", "Compromisso", "Conta a pagar"],
  },
} as const;

export function RecordsPage({ area }: { area: RecordArea }) {
  const { title: heading, categories } = settings[area];
  const records = useRecordStore((state) => state.records).filter((record) => record.area === area);
  const tasks = useTaskStore((state) => state.tasks);
  const addRecord = useRecordStore((state) => state.addRecord);
  const toggleRecord = useRecordStore((state) => state.toggleRecord);
  const removeRecord = useRecordStore((state) => state.removeRecord);
  const updateRecord = useRecordStore((state) => state.updateRecord);
  const [category, setCategory] = useState<string>(categories[0]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const visible = records.filter((record) => getProjectProgress(record, tasks).isComplete === showCompleted)
    .filter((record) => !normalizedSearch || `${record.title} ${record.details} ${record.category}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch))
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));

  return <section className="records-page">
    <header className="page-header"><div><h2>{heading}</h2><p>Organize cada projeto em tarefas e acompanhe o progresso.</p></div><PageSearch value={search} onChange={setSearch} placeholder="Buscar projeto, tipo ou detalhe..." /></header>
    <form className="records-form" onSubmit={(event) => {
      event.preventDefault();
      if (!title.trim()) return;
      addRecord({ id: crypto.randomUUID(), area, category, title: title.trim(), details: details.trim(), dueDate: dueDate || undefined, completed: false, createdAt: new Date().toISOString() });
      setTitle(""); setDetails(""); setDueDate("");
    }}>
      <label>Tipo<select value={category} onChange={(event) => setCategory(event.target.value)}>
        {categories.map((value) => <option key={value} value={value}>{value}</option>)}
      </select></label>
      <label>Projeto ou objetivo<input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Ex.: Finalizar projeto elétrico" /></label>
      <label>Prazo<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
      <label className="records-details">Detalhes<textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={3} /></label>
      <button type="submit">Adicionar</button>
    </form>
    <div className="records-tabs">
      <button type="button" className={!showCompleted ? "active" : ""} onClick={() => setShowCompleted(false)}>Pendentes ({records.filter((record) => !getProjectProgress(record, tasks).isComplete).length})</button>
      <button type="button" className={showCompleted ? "active" : ""} onClick={() => setShowCompleted(true)}>Concluídos ({records.filter((record) => getProjectProgress(record, tasks).isComplete).length})</button>
    </div>
    <div className="records-list">{visible.length === 0 ? <div className="empty-state"><strong>Nenhum projeto nesta aba.</strong><p>Crie um projeto acima e depois divida o resultado em pequenas tarefas.</p></div> : visible.map((record) =>
      <ProjectCard key={record.id} record={record} toggleRecord={toggleRecord} removeRecord={removeRecord} updateRecord={updateRecord} />,
    )}</div>
  </section>;
}

function ProjectCard({ record, toggleRecord, removeRecord, updateRecord }: {
  record: HubRecord;
  toggleRecord: (id: string) => void;
  removeRecord: (id: string) => void;
  updateRecord: (id: string, values: Partial<Omit<HubRecord, "id" | "createdAt">>) => void;
}) {
  const sites = useSiteStore((state) => state.sites).filter((site) => site.projectIds.includes(record.id));
  const unlinkSiteProject = useSiteStore((state) => state.unlinkProject);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("normal");
  const allTasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const unlinkProject = useTaskStore((state) => state.unlinkProject);
  const { tasks, completed: done, percent: progress, isComplete } = getProjectProgress(record, allTasks);

  return <article className="record-card project-card">
    <div className="project-main">
      <span className="record-category">{record.category}</span>
      <h3>{record.title}</h3>
      {record.details && <p>{record.details}</p>}
      {record.dueDate && <small>Prazo: {record.dueDate.split("-").reverse().join("/")}</small>}
      {sites.length > 0 && <div className="site-project-links"><span>Sites:</span>{sites.map((site) => <Link key={site.id} to={`/sites?site=${site.id}`}>{site.name}</Link>)}</div>}
      <div className="project-progress"><span>{done} de {tasks.length} tarefas concluídas ({progress}%)</span>
        <progress max={100} value={progress} aria-label={`Progresso de ${record.title}`} /></div>
      <ul className="project-task-list">{tasks.map((task) => <li key={task.id}>
        <label><input type="checkbox" checked={task.status === "completed"} onChange={() => toggleTask(task.id)} />
          <span className={task.status === "completed" ? "project-task-done" : ""}>{task.title}</span></label>
        <ConfirmButton ariaLabel={`Excluir tarefa ${task.title}`} onConfirm={() => removeTask(task.id)} />
      </li>)}</ul>
      <form className="project-task-form" onSubmit={(event) => {
        event.preventDefault();
        if (!taskTitle.trim()) return;
        addTask({ id: crypto.randomUUID(), projectId: record.id, title: taskTitle.trim(), area: record.area,
          priority: taskPriority, status: "todo", deadline: taskDeadline || undefined, createdAt: new Date().toISOString() });
        setTaskTitle(""); setTaskDeadline("");
      }}>
        <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Nova tarefa deste projeto" aria-label={`Nova tarefa de ${record.title}`} />
        <input type="date" value={taskDeadline} onChange={(event) => setTaskDeadline(event.target.value)} aria-label="Prazo da tarefa" />
        <select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as TaskPriority)} aria-label="Prioridade da tarefa">
          <option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option>
        </select>
        <button type="submit">Adicionar tarefa</button>
      </form>
    </div>
    <div className="record-actions">
      <button type="button" onClick={() => {
        const nextTitle = window.prompt("Nome do projeto", record.title);
        if (!nextTitle?.trim()) return;
        const nextDetails = window.prompt("Detalhes", record.details) ?? record.details;
        updateRecord(record.id, { title: nextTitle.trim(), details: nextDetails.trim() });
      }}>Editar</button>
      {tasks.length === 0 && <button type="button" onClick={() => toggleRecord(record.id)}>{record.completed ? "Reabrir" : "Concluir"}</button>}
      {tasks.length > 0 && <span className="record-category">{isComplete ? "Concluído" : "Em andamento"}</span>}
      <ConfirmButton label="Excluir projeto" ariaLabel={`Excluir o projeto ${record.title}`} onConfirm={() => { unlinkProject(record.id); unlinkSiteProject(record.id); removeRecord(record.id); }} />
    </div>
  </article>;
}
