import type { HubRecord } from "../../stores/useRecordStore";
import type { Task } from "../../stores/useTaskStore";

export function getProjectProgress(project: HubRecord, allTasks: Task[]) {
  const tasks = allTasks.filter((task) => task.projectId === project.id);
  const completed = tasks.filter((task) => task.status === "completed").length;
  return {
    tasks,
    completed,
    percent: tasks.length === 0 ? 0 : Math.round(completed / tasks.length * 100),
    isComplete: tasks.length === 0 ? project.completed : completed === tasks.length,
  };
}
