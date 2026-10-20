import { useTaskStore } from "../stores/useTaskStore";
import { useRecordStore } from "../stores/useRecordStore";
import { useInventoryStore } from "../stores/useInventoryStore";
import { getProjectProgress } from "../features/projects/progress";
export function ReviewPage() {
  return <section><header className="page-header"><div><h2>Revisão semanal</h2><p>Limpe pendências e prepare a próxima semana.</p></div></header><ReviewPanel /></section>;
}
export function ReviewPanel() {
  const tasks = useTaskStore((state) => state.tasks); const projects = useRecordStore((state) => state.records); const inventory = useInventoryStore((state) => state.inventory);
  const open = tasks.filter((task) => task.status !== "completed");
  const noDeadline = open.filter((task) => !task.deadline); const waiting = open.filter((task) => task.status === "waiting");
  const noNextAction = projects.filter((project) => !getProjectProgress(project, tasks).isComplete && !tasks.some((task) => task.projectId === project.id && task.status !== "completed"));
  const lowStock = inventory.filter((item) => item.minimumStock !== undefined && item.quantity <= item.minimumStock);
  return <div className="weekly-review-panel"><h3>Revisão semanal</h3><p>Limpe pendências e prepare a próxima semana.</p>
    <div className="review-grid"><Review title="Tarefas sem prazo" items={noDeadline.map((item) => item.title)} /><Review title="Aguardando alguém" items={waiting.map((item) => item.title)} /><Review title="Projetos sem próxima ação" items={noNextAction.map((item) => item.title)} /><Review title="Estoque pedindo atenção" items={lowStock.map((item) => `${item.product}: ${item.quantity}`)} /></div>
    <div className="review-checklist"><h3>Ritual recomendado</h3><label><input type="checkbox" /> Esvaziar a Caixa de entrada</label><label><input type="checkbox" /> Revisar atrasos e prazos</label><label><input type="checkbox" /> Definir até cinco tarefas para Meu dia</label><label><input type="checkbox" /> Conferir calendário da próxima semana</label></div>
  </div>;
}
function Review({ title, items }: { title: string; items: string[] }) { return <article className="review-card"><h3>{title} <span>{items.length}</span></h3>{items.length ? <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>Tudo certo.</p>}</article>; }
