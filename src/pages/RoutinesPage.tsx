import { localDate } from "../utils/calendar";
import { useState } from "react";
import { useRoutineStore, type Routine } from "../stores/useRoutineStore";
import { ReviewPanel } from "./ReviewPage";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";
export function RoutinesPage() {
  const routines = useRoutineStore((state) => state.routines); const addRoutine = useRoutineStore((state) => state.addRoutine);
  const [title, setTitle] = useState(""); const [moment, setMoment] = useState("Início do dia"); const [search, setSearch] = useState("");
  const visibleRoutines = routines.filter((routine) => `${routine.title} ${routine.moment} ${routine.steps.map((step) => step.text).join(" ")}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  return <section><header className="page-header"><div><h2>Rotinas e revisão</h2><p>Adapte sua rotina e faça a revisão semanal no mesmo lugar.</p></div><PageSearch value={search} onChange={setSearch} placeholder="Buscar rotina ou etapa..." /></header>
    <form className="quick-form" onSubmit={(event) => { event.preventDefault(); if (!title.trim()) return; addRoutine({ id: crypto.randomUUID(), title: title.trim(), moment, active: true, steps: [], completions: {} }); setTitle(""); }}>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Rotina do semestre" />
      <select value={moment} onChange={(event) => setMoment(event.target.value)}><option>Início do dia</option><option>Durante o trabalho</option><option>Fim do dia</option><option>Semanal</option><option>Personalizada</option></select>
      <button type="submit">Criar rotina</button>
    </form><div className="routine-grid">{visibleRoutines.length === 0 && <div className="empty-state"><strong>{routines.length ? "Nenhuma rotina encontrada." : "Nenhuma rotina cadastrada."}</strong></div>}{visibleRoutines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}</div><ReviewPanel />
  </section>;
}
function RoutineCard({ routine }: { routine: Routine }) {
  const today = localDate();
  const updateRoutine = useRoutineStore((state) => state.updateRoutine); const removeRoutine = useRoutineStore((state) => state.removeRoutine); const toggleActive = useRoutineStore((state) => state.toggleActive);
  const addStep = useRoutineStore((state) => state.addStep); const updateStep = useRoutineStore((state) => state.updateStep); const removeStep = useRoutineStore((state) => state.removeStep); const toggleStep = useRoutineStore((state) => state.toggleStep);
  const [editing, setEditing] = useState(false); const [title, setTitle] = useState(routine.title); const [moment, setMoment] = useState(routine.moment); const [newStep, setNewStep] = useState("");
  const completed = (routine.completions[today] ?? []).filter((id) => routine.steps.some((step) => step.id === id)); const percent = routine.steps.length ? Math.round(completed.length / routine.steps.length * 100) : 0;
  return <article className={`routine-card ${routine.active ? "" : "routine-inactive"}`}><header><div><span>{routine.moment}</span><h3>{routine.title}</h3></div><strong>{percent}%</strong></header>
    {editing && <div className="routine-edit"><input value={title} onChange={(event) => setTitle(event.target.value)} /><input value={moment} onChange={(event) => setMoment(event.target.value)} /><button onClick={() => { if (title.trim()) updateRoutine(routine.id, { title: title.trim(), moment: moment.trim() || "Personalizada" }); setEditing(false); }}>Salvar</button></div>}
    <progress max={100} value={percent} /><ul>{routine.steps.map((step) => <li key={step.id}><label><input type="checkbox" disabled={!routine.active} checked={completed.includes(step.id)} onChange={() => toggleStep(routine.id, step.id, today)} />{editing ? <input value={step.text} onChange={(event) => updateStep(routine.id, step.id, event.target.value)} /> : <span className={completed.includes(step.id) ? "project-task-done" : ""}>{step.text}</span>}</label>{editing && <button onClick={() => removeStep(routine.id, step.id)}>Excluir</button>}</li>)}</ul>
    {editing && <form className="routine-add-step" onSubmit={(event) => { event.preventDefault(); if (!newStep.trim()) return; addStep(routine.id, { id: crypto.randomUUID(), text: newStep.trim() }); setNewStep(""); }}><input value={newStep} onChange={(event) => setNewStep(event.target.value)} placeholder="Nova etapa" /><button>Adicionar</button></form>}
    <footer><button onClick={() => setEditing(!editing)}>{editing ? "Fechar edição" : "Editar"}</button><button onClick={() => toggleActive(routine.id)}>{routine.active ? "Arquivar" : "Ativar"}</button><ConfirmButton ariaLabel={`Excluir a rotina ${routine.title}`} onConfirm={() => removeRoutine(routine.id)} /></footer>
  </article>;
}
