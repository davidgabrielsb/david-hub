import { localDate } from "../utils/calendar";
import { useState } from "react";
import { useRoutineStore, type Routine } from "../stores/useRoutineStore";
import { ReviewPanel } from "./ReviewPage";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";
import { EntityEditor } from "../components/EntityEditor";
import { OrganizedList } from "../components/ListOrganization";
export function RoutinesPage() {
  const routines = useRoutineStore((state) => state.routines); const addRoutine = useRoutineStore((state) => state.addRoutine);
  const [title, setTitle] = useState(""); const [moment, setMoment] = useState("Início do dia"); const [search, setSearch] = useState("");
  const visibleRoutines = routines.filter((routine) => `${routine.title} ${routine.moment} ${routine.steps.map((step) => step.text).join(" ")}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  return <section><header className="page-header"><div><h2>Rotinas e revisão</h2><p>Adapte sua rotina e faça a revisão semanal no mesmo lugar.</p></div><PageSearch value={search} onChange={setSearch} placeholder="Buscar rotina ou etapa..." /></header>
    <form className="quick-form" onSubmit={(event) => { event.preventDefault(); if (!title.trim()) return; addRoutine({ id: crypto.randomUUID(), title: title.trim(), moment, active: true, steps: [], completions: {} }); setTitle(""); }}>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Rotina do semestre" />
      <select value={moment} onChange={(event) => setMoment(event.target.value)}><option>Início do dia</option><option>Durante o trabalho</option><option>Fim do dia</option><option>Semanal</option><option>Personalizada</option></select>
      <button type="submit">Criar rotina</button>
    </form>{visibleRoutines.length === 0 && <div className="empty-state"><strong>{routines.length ? "Nenhuma rotina encontrada." : "Nenhuma rotina cadastrada."}</strong></div>}<OrganizedList collection="routines:items" items={visibleRoutines} label={(routine) => routine.title} name="rotinas" className="routine-grid">{(routine) => <RoutineCard routine={routine} />}</OrganizedList><ReviewPanel />
  </section>;
}
function RoutineCard({ routine }: { routine: Routine }) {
  const today = localDate();
  const updateRoutine = useRoutineStore((state) => state.updateRoutine); const removeRoutine = useRoutineStore((state) => state.removeRoutine); const toggleActive = useRoutineStore((state) => state.toggleActive);
  const addStep = useRoutineStore((state) => state.addStep); const updateStep = useRoutineStore((state) => state.updateStep); const removeStep = useRoutineStore((state) => state.removeStep); const toggleStep = useRoutineStore((state) => state.toggleStep);
  const [editing, setEditing] = useState(false); const [editingStep, setEditingStep] = useState<{ id: string; text: string } | null>(null); const [newStep, setNewStep] = useState("");
  const completed = (routine.completions[today] ?? []).filter((id) => routine.steps.some((step) => step.id === id)); const percent = routine.steps.length ? Math.round(completed.length / routine.steps.length * 100) : 0;
  return <article className={`routine-card ${routine.active ? "" : "routine-inactive"}`}><header><div><span>{routine.moment}</span><h3>{routine.title}</h3></div><strong>{percent}%</strong></header>
    <progress max={100} value={percent} /><OrganizedList collection={`routines:steps:${routine.id}`} items={routine.steps} label={(step) => step.text} name="etapas" className="routine-step-list">{(step) => <div className="routine-step-row"><label><input type="checkbox" disabled={!routine.active} checked={completed.includes(step.id)} onChange={() => toggleStep(routine.id, step.id, today)} /><span className={completed.includes(step.id) ? "project-task-done" : ""}>{step.text}</span></label><button type="button" onClick={() => setEditingStep(step)}>Editar</button><ConfirmButton ariaLabel={`Excluir etapa ${step.text}`} onConfirm={() => removeStep(routine.id, step.id)} /></div>}</OrganizedList>
    <form className="routine-add-step" onSubmit={(event) => { event.preventDefault(); if (!newStep.trim()) return; addStep(routine.id, { id: crypto.randomUUID(), text: newStep.trim() }); setNewStep(""); }}><input aria-label={`Nova etapa de ${routine.title}`} value={newStep} onChange={(event) => setNewStep(event.target.value)} placeholder="Nova etapa" /><button>Adicionar</button></form>
    <footer><button onClick={() => setEditing(true)}>Editar rotina</button><button onClick={() => toggleActive(routine.id)}>{routine.active ? "Arquivar" : "Ativar"}</button><ConfirmButton ariaLabel={`Excluir a rotina ${routine.title}`} onConfirm={() => removeRoutine(routine.id)} /></footer>
    {editing && <EntityEditor title="Editar rotina" initial={{ title: routine.title, moment: routine.moment }} fields={[{ name: "title", label: "Nome da rotina", required: true }, { name: "moment", label: "Momento ou frequência", required: true }]} onSave={(values) => updateRoutine(routine.id, { title: values.title, moment: values.moment })} onClose={() => setEditing(false)} />}
    {editingStep && <EntityEditor key={editingStep.id} title="Editar etapa" initial={{ text: editingStep.text }} fields={[{ name: "text", label: "Etapa", type: "textarea", required: true }]} onSave={(values) => updateStep(routine.id, editingStep.id, values.text)} onClose={() => setEditingStep(null)} />}
  </article>;
}
