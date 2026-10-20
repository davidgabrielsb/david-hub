import { useState } from "react";
import { TaskEditor } from "../components/TaskEditor";

import { DateField } from "../components/forms/DateField";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";
import { useRecordStore } from "../stores/useRecordStore";

import {
  useTaskStore,
  type Task,
  type TaskArea,
  type TaskPriority,
  type TaskStatus,
} from "../stores/useTaskStore";

export function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const projects = useRecordStore((state) => state.records);

  const addTask = useTaskStore(
    (state) => state.addTask,
  );

  const toggleTask = useTaskStore(
    (state) => state.toggleTask,
  );

  const removeTask = useTaskStore(
    (state) => state.removeTask,
  );
  const setTaskProject = useTaskStore((state) => state.setTaskProject);
  const setTaskStatus = useTaskStore((state) => state.setTaskStatus);
  const togglePlannedToday = useTaskStore((state) => state.togglePlannedToday);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [title, setTitle] = useState("");

  const [area, setArea] =
    useState<TaskArea>("work");

  const [priority, setPriority] =
    useState<TaskPriority>("normal");

  const [deadline, setDeadline] =
    useState("");

  const [time, setTime] =
    useState("");
  const [projectId, setProjectId] = useState("");
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "work" | "study" | "personal" | "completed"
  >("all");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    addTask({
      id: crypto.randomUUID(),

      title: title.trim(),

      area,

      projectId: projects.some((project) => project.id === projectId && project.area === area)
        ? projectId : undefined,

      priority,

      status: "todo",

      deadline:
        deadline || undefined,

      time:
        time || undefined,

      createdAt:
        new Date().toISOString(),
    });

    setTitle("");
    setDeadline("");
    setTime("");
    setProjectId("");
  }

  /*
   * Primeiro filtramos as tarefas.
   *
   * Depois ordenamos sem alterar a store original.
   */
const filteredTasks = tasks
  .filter((task) => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const projectName = projects.find((project) => project.id === task.projectId)?.title ?? "";
    if (query && !`${task.title} ${projectName}`.toLocaleLowerCase("pt-BR").includes(query)) return false;
    // A aba "Concluídas" mostra somente tarefas concluídas
    if (filter === "completed") {
      return task.status === "completed";
    }

    // Tarefas concluídas somem das demais abas
    if (task.status === "completed") {
      return false;
    }

    // "Todas" mostra todas as tarefas ainda abertas
    if (filter === "all") {
      return true;
    }

    // Trabalho, Estudos ou Pessoal
    return task.area === filter;
  })
    .sort((a, b) => {
      /*
       * Tarefas concluídas ficam por último.
       */
      if (
        a.status === "completed" &&
        b.status !== "completed"
      ) {
        return 1;
      }

      if (
        a.status !== "completed" &&
        b.status === "completed"
      ) {
        return -1;
      }

      /*
       * Quanto maior o número,
       * maior a prioridade.
       */
      const priorityOrder: Record<
        TaskPriority,
        number
      > = {
        urgent: 4,
        high: 3,
        normal: 2,
        low: 1,
      };

      const priorityDifference =
        priorityOrder[b.priority] -
        priorityOrder[a.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      /*
       * Se as duas tarefas têm prazo,
       * a data mais próxima vem primeiro.
       *
       * Como usamos YYYY-MM-DD,
       * localeCompare funciona corretamente
       * para ordenar cronologicamente.
       */
      if (a.deadline && b.deadline) {
        return a.deadline.localeCompare(
          b.deadline,
        );
      }

      /*
       * Tarefa com prazo vem antes
       * de tarefa sem prazo.
       */
      if (a.deadline && !b.deadline) {
        return -1;
      }

      if (!a.deadline && b.deadline) {
        return 1;
      }

      return 0;
    });

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Tarefas</h2>

          <p>
            Central de tarefas do David Hub.
          </p>
        </div>
        <PageSearch value={search} onChange={setSearch} placeholder="Buscar tarefa ou projeto..." />
      </header>

      <form
        className="task-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="task-title">
            Tarefa
          </label>

          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Ex: Revisar projeto elétrico"
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-area">
            Área
          </label>

          <select
            id="task-area"
            value={area}
            onChange={(event) => {
              setArea(event.target.value as TaskArea);
              setProjectId("");
            }}
          >
            <option value="work">
              Trabalho
            </option>

            <option value="study">
              Estudos
            </option>

            <option value="personal">
              Pessoal
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-project">Projeto ou etapa</label>
          <select id="task-project" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="">Sem projeto</option>
            {projects.filter((project) => project.area === area).map((project) =>
              <option key={project.id} value={project.id}>{project.title}</option>,
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-priority">
            Prioridade
          </label>

          <select
            id="task-priority"
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value as TaskPriority,
              )
            }
          >
            <option value="low">
              Baixa
            </option>

            <option value="normal">
              Normal
            </option>

            <option value="high">
              Alta
            </option>

            <option value="urgent">
              Urgente
            </option>
          </select>
        </div>

        <div className="form-group">
          <label>
            Prazo
          </label>

          <DateField
            value={deadline}
            onChange={setDeadline}
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-time">
            Horário
          </label>

          <input
            id="task-time"
            type="time"
            value={time}
            onChange={(event) =>
              setTime(event.target.value)
            }
          />
        </div>

        <div className="task-form-actions">
          <button type="submit">
            + Adicionar tarefa
          </button>
        </div>
      </form>

      <div className="task-filters">
        <button
          type="button"
          className={
            filter === "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("all")
          }
        >
          Todas
        </button>

        <button
          type="button"
          className={
            filter === "work"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("work")
          }
        >
          Trabalho
        </button>

        <button
          type="button"
          className={
            filter === "study"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("study")
          }
        >
          Estudos
        </button>

        <button
          type="button"
          className={
            filter === "personal"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("personal")
          }
        >
          Pessoal
        </button>

        <button
          type="button"
          className={
            filter === "completed"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("completed")
          }
        >
          Concluídas
        </button>
      </div>

      {editingTask && <TaskEditor key={editingTask.id} task={editingTask} onClose={() => setEditingTask(null)} />}
      <div className="task-list">
        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <strong>Nenhuma tarefa nesta lista.</strong>
            <p>Use o formulário acima ou o botão “+ Adicionar” para criar a próxima ação.</p>
          </div>
        )}

        {filteredTasks.map((task) => (
          <article
            key={task.id}
            data-priority={task.priority}
            data-area={task.area}
            className={
              task.status === "completed"
                ? "task-card completed"
                : "task-card"
            }
          >
            <div className="task-card-main">
              <button
                type="button"
                className="task-check"
                onClick={() =>
                  toggleTask(task.id)
                }
                aria-label={
                  task.status === "completed"
                    ? "Reabrir tarefa"
                    : "Concluir tarefa"
                }
              >
                {task.status === "completed"
                  ? "✓"
                  : ""}
              </button>

              <div>
                <h3>
                  {task.title}
                </h3>

                {task.description && <p>{task.description}</p>}
                <div className="task-meta">
                  <span>
                    {getAreaLabel(
                      task.area,
                    )}
                  </span>

                  <select className="task-project-select" value={projects.some((project) => project.id === task.projectId) ? task.projectId : ""}
                    aria-label={`Projeto da tarefa ${task.title}`}
                    onChange={(event) => setTaskProject(task.id, event.target.value || undefined)}>
                    <option value="">Sem projeto</option>
                    {projects.filter((project) => project.area === task.area).map((project) =>
                      <option key={project.id} value={project.id}>{project.title}</option>,
                    )}
                  </select>

                  <span className="priority-badge">
                    {getPriorityLabel(
                      task.priority,
                    )}
                  </span>

                  {task.deadline && (
                    <span>
                      {formatDate(
                        task.deadline,
                      )}
                    </span>
                  )}

                  {task.time && (
                    <span>
                      {task.time}
                    </span>
                  )}
                  {task.plannedToday && <span>Meu dia</span>}
                </div>
                {task.status !== "completed" && <div className="task-inline-actions">
                  <select value={task.status} onChange={(event) => setTaskStatus(task.id, event.target.value as TaskStatus)} aria-label={`Status de ${task.title}`}>
                    <option value="todo">Próxima ação</option><option value="doing">Em andamento</option><option value="waiting">Aguardando</option><option value="someday">Algum dia</option>
                  </select>
                  <button type="button" className={task.plannedToday ? "active-action" : ""} onClick={() => togglePlannedToday(task.id)}>{task.plannedToday ? "Remover do meu dia" : "Colocar no meu dia"}</button>
                </div>}
              </div>
            </div>

            <div className="task-card-actions"><button type="button" className="task-delete" onClick={() => setEditingTask(task)}>Editar</button><ConfirmButton className="task-delete" ariaLabel={`Excluir a tarefa ${task.title}`} onConfirm={() => removeTask(task.id)} /></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getAreaLabel(
  area: TaskArea,
) {
  const labels: Record<
    TaskArea,
    string
  > = {
    work: "Trabalho",
    study: "Estudos",
    personal: "Pessoal",
  };

  return labels[area];
}

function getPriorityLabel(
  priority: TaskPriority,
) {
  const labels: Record<
    TaskPriority,
    string
  > = {
    low: "Baixa",
    normal: "Normal",
    high: "Alta",
    urgent: "Urgente",
  };

  return labels[priority];
}

function formatDate(
  date: string,
) {
  const [
    year,
    month,
    day,
  ] = date.split("-");

  return `${day}/${month}/${year}`;
}
