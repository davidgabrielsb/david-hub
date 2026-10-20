import { useEffect, useRef, useState } from "react";
import { useTaskStore, type Task, type TaskArea, type TaskPriority } from "../stores/useTaskStore";
import { useRecordStore } from "../stores/useRecordStore";
import { DateField } from "./forms/DateField";

export function TaskEditor({ task, onClose }: { task: Task; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(task);
  const projects = useRecordStore((state) => state.records);
  const updateTask = useTaskStore((state) => state.updateTask);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    element.showModal();
    return () => { element.close(); previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} className="quick-modal task-editor" aria-labelledby="task-editor-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h3 id="task-editor-title">Editar tarefa</h3><button type="button" aria-label="Fechar edição" onClick={onClose}>×</button></header>
    <form onSubmit={(event) => {
      event.preventDefault();
      if (!draft.title.trim()) return;
      updateTask(task.id, { title: draft.title.trim(), description: draft.description?.trim() || undefined, area: draft.area, priority: draft.priority, deadline: draft.deadline || undefined, time: draft.time || undefined, projectId: projects.some((project) => project.id === draft.projectId && project.area === draft.area) ? draft.projectId : undefined });
      onClose();
    }}>
      <label>Título<input autoFocus required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
      <label>Descrição<textarea rows={3} value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
      <label>Área<select value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value as TaskArea, projectId: undefined })}><option value="work">Trabalho</option><option value="study">Estudos</option><option value="personal">Pessoal</option></select></label>
      <label>Projeto ou etapa<select value={draft.projectId ?? ""} onChange={(event) => setDraft({ ...draft, projectId: event.target.value })}><option value="">Sem projeto</option>{projects.filter((project) => project.area === draft.area).map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>
      <label>Prioridade<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskPriority })}><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label>
      <div><span>Prazo</span><DateField value={draft.deadline ?? ""} onChange={(deadline) => setDraft({ ...draft, deadline })} /></div>
      <label>Horário<input type="time" value={draft.time ?? ""} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
      <footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit">Salvar alterações</button></footer>
    </form>
  </dialog>;
}
