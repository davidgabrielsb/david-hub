import { useTaskStore } from "../stores/useTaskStore";
import { useRecordStore } from "../stores/useRecordStore";
import { useInventoryStore } from "../stores/useInventoryStore";
import { getProjectProgress } from "../features/projects/progress";
import { OrganizedList } from "../components/ListOrganization";
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
    <div className="review-grid"><Review collection="tasks:review:no-deadline" title="Tarefas sem prazo" items={noDeadline.map((item) => ({ id: item.id, title: item.title }))} /><Review collection="tasks:review:waiting" title="Aguardando alguém" items={waiting.map((item) => ({ id: item.id, title: item.title }))} /><Review collection="records:review:no-action" title="Projetos sem próxima ação" items={noNextAction.map((item) => ({ id: item.id, title: item.title }))} /><Review collection="inventory:review:low" title="Estoque pedindo atenção" items={lowStock.map((item) => ({ id: item.id, title: `${item.product}: ${item.quantity}` }))} /></div>
    <div className="review-checklist"><h3>Ritual recomendado</h3><label><input type="checkbox" /> Esvaziar a Caixa de entrada</label><label><input type="checkbox" /> Revisar atrasos e prazos</label><label><input type="checkbox" /> Definir até cinco tarefas para Meu dia</label><label><input type="checkbox" /> Conferir calendário da próxima semana</label></div>
  </div>;
}
function Review({ collection, title, items }: { collection: string; title: string; items: { id: string; title: string }[] }) { return <article className="review-card"><h3>{title} <span>{items.length}</span></h3>{items.length ? <OrganizedList collection={collection} items={items} label={(item) => item.title} className="review-item-list">{(item) => <p>{item.title}</p>}</OrganizedList> : <p>Tudo certo.</p>}</article>; }
