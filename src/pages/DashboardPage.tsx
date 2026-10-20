import { Children, isValidElement, useState } from "react";
import { useTaskStore, type Task } from "../stores/useTaskStore";
import { OrganizedList } from "../components/ListOrganization";
import { TaskEditor } from "../components/TaskEditor";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useRecordStore } from "../stores/useRecordStore";
import { getProjectProgress } from "../features/projects/progress";
import { useFinanceStore } from "../stores/useFinanceStore";
import { AreaFilter, matchesArea, useAreaFilter } from "../components/AreaFilter";

export function DashboardPage() {
  const { selected, select } = useAreaFilter();
  const allTasks = useTaskStore((state) => state.tasks);
  const tasks = allTasks.filter((task) => matchesArea(task.area, selected));
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const togglePlannedToday = useTaskStore((state) => state.togglePlannedToday);
  const inventory = useInventoryStore((state) => state.inventory);
  const records = useRecordStore((state) => state.records);
  const bills = useFinanceStore((state) => state.bills);
  const stockAlerts = inventory.filter((item) =>
    matchesArea("work", selected) && item.minimumStock !== undefined && item.quantity <= item.minimumStock,
  );

  const today = formatDateKey(new Date());
  const dueRecords = records.filter((record) =>
    matchesArea(record.area, selected) && !getProjectProgress(record, allTasks).isComplete && record.dueDate && record.dueDate <= today,
  );
  const dueBills = bills.filter((bill) => matchesArea("personal", selected) && !bill.paid && bill.dueDate <= addDays(today, 7));

  const openTasks = tasks.filter(
    (task) => task.status !== "completed",
  );

  const todayTasks = openTasks.filter(
    (task) => task.deadline === today || task.plannedToday,
  );
  const myDayTasks = tasks.filter((task) => task.deadline === today || task.plannedToday);

  const overdueTasks = openTasks.filter(
    (task) =>
      task.deadline &&
      task.deadline < today,
  );

  const priorityTasks = openTasks.filter(
    (task) =>
      task.priority === "urgent" ||
      task.priority === "high",
  );

  const upcomingTasks = openTasks
    .filter((task) => {
      if (!task.deadline) {
        return false;
      }

      return (
        task.deadline > today &&
        task.deadline <= addDays(today, 7)
      );
    })
    .sort((a, b) =>
      (a.deadline ?? "").localeCompare(
        b.deadline ?? "",
      ),
    );

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  );

  const workTasks = openTasks.filter(
    (task) => task.area === "work",
  );

  const studyTasks = openTasks.filter(
    (task) => task.area === "study",
  );

  const personalTasks = openTasks.filter(
    (task) => task.area === "personal",
  );

  return (
    <section>
      <header className="dashboard-header">
        <div>
          <h2>Início</h2>

          <p>
            Visão geral do que precisa da sua atenção.
          </p>
        </div>

        <div className="dashboard-date">
          {formatFullDate(new Date())}
        </div>
      </header>
      <AreaFilter value={selected} onChange={select} />

      <div className="dashboard-summary">
        <SummaryCard
          label="Abertas"
          value={openTasks.length}
        />

        <SummaryCard
          label="Hoje"
          value={todayTasks.length}
        />

        <SummaryCard
          label="Atrasadas"
          value={overdueTasks.length}
        />

        <SummaryCard
          label="Concluídas"
          value={completedTasks.length}
        />
        <SummaryCard label="Outras pendências" value={dueRecords.length} />
      </div>

      <div className="dashboard-grid">
        <DashboardCard
          title={`Meu dia • ${myDayTasks.filter((task) => task.status === "completed").length}/${myDayTasks.length}`}
          emptyText="Nenhuma tarefa para hoje."
        >
          {todayTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              title={task.title}
              meta={getAreaLabel(task.area)}
              onComplete={() => toggleTask(task.id)}
              onRemove={() => togglePlannedToday(task.id)}
            />
          ))}
        </DashboardCard>

        <DashboardCard
          title="Prioridades"
          emptyText="Nenhuma prioridade no momento."
        >
          {priorityTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              title={task.title}
              meta={`${getPriorityLabel(
                task.priority,
              )}${task.deadline
                ? ` • ${formatShortDate(
                    task.deadline,
                  )}`
                : ""}`}
            />
          ))}
          {stockAlerts.map((item) => (
            <TaskRow
              key={`stock-${item.id}`}
              title={`${item.product} • ${item.brand}`}
              meta={`Estoque: ${item.quantity} / mínimo: ${item.minimumStock}${item.quantity < (item.minimumStock ?? 0) ? " • abaixo do mínimo" : " • no mínimo"}`}
            />
          ))}
          {dueRecords.map((record) => (
            <TaskRow key={`record-${record.id}`} title={record.title}
              meta={`${record.category} • ${record.dueDate?.split("-").reverse().join("/")}`} />
          ))}
          {dueBills.map((bill) => <TaskRow key={`bill-${bill.id}`} title={`Conta: ${bill.title}`} meta={`R$ ${bill.amount.toFixed(2).replace(".", ",")} • ${formatShortDate(bill.dueDate)}`} />)}
        </DashboardCard>

        <DashboardCard
          title="Atrasadas"
          emptyText="Nenhuma tarefa atrasada."
        >
          {overdueTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              title={task.title}
              meta={
                task.deadline
                  ? formatShortDate(
                      task.deadline,
                    )
                  : ""
              }
            />
          ))}
        </DashboardCard>

        <DashboardCard
          title="Próximos 7 dias"
          emptyText="Nenhum prazo próximo."
        >
          {upcomingTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              title={task.title}
              meta={
                task.deadline
                  ? formatShortDate(
                      task.deadline,
                    )
                  : ""
              }
            />
          ))}
        </DashboardCard>
      </div>
      {todayTasks.length > 5 && <p className="day-guidance">Seu Meu dia tem mais de cinco tarefas abertas. Escolha as cinco mais importantes para manter o foco.</p>}

      <div className="dashboard-area-summary">
        {matchesArea("work", selected) && <AreaCard
          label="Trabalho"
          value={workTasks.length}
        />}

        {matchesArea("study", selected) && <AreaCard
          label="Estudos"
          value={studyTasks.length}
        />}

        {matchesArea("personal", selected) && <AreaCard
          label="Pessoal"
          value={personalTasks.length}
        />}
      </div>
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="summary-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}

function DashboardCard({
  title,
  emptyText,
  children,
}: DashboardCardProps) {
  const rows = Children.toArray(children).flatMap((child) => isValidElement<TaskRowProps>(child) ? [{ id: String(child.key), title: child.props.title, node: child }] : []);

  return (
    <div className="dashboard-card">
      <h3>{title}</h3>

      <div className="dashboard-card-content">
        {rows.length > 0
          ? <OrganizedList collection={`tasks:dashboard:${title.split(" •")[0]}`} items={rows} label={(row) => row.title} className="dashboard-card-content">{(row) => row.node}</OrganizedList>
          : (
            <p className="dashboard-empty">
              {emptyText}
            </p>
          )}
      </div>
    </div>
  );
}

interface TaskRowProps {
  task?: Task;
  title: string;
  meta: string;
  onComplete?: () => void;
  onRemove?: () => void;
}

function TaskRow({
  task,
  title,
  meta,
  onComplete,
  onRemove,
}: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="dashboard-task-row">
      <div>
        <strong>{title}</strong>

        <span>
          {meta}
        </span>
      </div>
      {(onComplete || onRemove) && <div className="dashboard-row-actions">{onComplete && <button onClick={onComplete}>Concluir</button>}{onRemove && <button onClick={onRemove}>Remover</button>}</div>}
      {task && <div className="dashboard-row-actions"><button type="button" onClick={() => setEditing(true)}>Editar</button></div>}
      {editing && task && <TaskEditor task={task} onClose={() => setEditing(false)} />}
    </div>
  );
}

interface AreaCardProps {
  label: string;
  value: number;
}

function AreaCard({
  label,
  value,
}: AreaCardProps) {
  return (
    <div className="area-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDateKey(
  date: Date,
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  dateString: string,
  amount: number,
) {
  const [
    year,
    month,
    day,
  ] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  date.setDate(
    date.getDate() + amount,
  );

  return formatDateKey(date);
}

function formatShortDate(
  date: string,
) {
  const [
    year,
    month,
    day,
  ] = date.split("-");

  return `${day}/${month}/${year}`;
}

function formatFullDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
    },
  ).format(date);
}

function getAreaLabel(
  area: "work" | "study" | "personal",
) {
  const labels = {
    work: "Trabalho",
    study: "Estudos",
    personal: "Pessoal",
  };

  return labels[area];
}

function getPriorityLabel(
  priority:
    | "low"
    | "normal"
    | "high"
    | "urgent",
) {
  const labels = {
    low: "Baixa",
    normal: "Normal",
    high: "Alta",
    urgent: "Urgente",
  };

  return labels[priority];
}
