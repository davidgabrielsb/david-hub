import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskArea =
  | "work"
  | "study"
  | "personal";

export type TaskPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type TaskStatus =
  | "todo"
  | "doing"
  | "waiting"
  | "someday"
  | "completed";

export interface Task {
  id: string;

  title: string;

  description?: string;

  area: TaskArea;

  priority: TaskPriority;

  status: TaskStatus;

  previousStatus?: Exclude<TaskStatus, "completed">;

  deadline?: string;

  time?: string;

  createdAt: string;
  projectId?: string;
  plannedToday?: boolean;
}

interface TaskStore {
  tasks: Task[];

  addTask: (task: Task) => void;

  toggleTask: (id: string) => void;

  removeTask: (id: string) => void;
  unlinkProject: (projectId: string) => void;
  setTaskProject: (id: string, projectId?: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  togglePlannedToday: (id: string) => void;
  updateTask: (id: string, values: Partial<Omit<Task, "id" | "createdAt">>) => void;
}

export const useTaskStore = create<TaskStore>()(persist((set) => ({
  tasks: [
    {
      id: "task-1",
      title: "Revisar projeto QGBT",
      area: "work",
      priority: "high",
      status: "todo",
      deadline: "2026-09-18",
      createdAt: "2026-09-17",
    },

    {
      id: "task-2",
      title: "Trabalho de IA",
      area: "study",
      priority: "high",
      status: "doing",
      deadline: "2026-09-19",
      createdAt: "2026-09-17",
    },
  ],

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return task.status === "completed"
          ? { ...task, status: task.previousStatus ?? "todo", previousStatus: undefined }
          : { ...task, previousStatus: task.status, status: "completed" };
      }),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => task.id !== id,
      ),
    })),
  unlinkProject: (projectId) => set((state) => ({
    tasks: state.tasks.map((task) => task.projectId === projectId
      ? { ...task, projectId: undefined } : task),
  })),
  setTaskProject: (id, projectId) => set((state) => ({
    tasks: state.tasks.map((task) => task.id === id ? { ...task, projectId } : task),
  })),
  setTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map((task) => task.id === id ? { ...task, status } : task),
  })),
  togglePlannedToday: (id) => set((state) => ({
    tasks: state.tasks.map((task) => task.id === id
      ? { ...task, plannedToday: !task.plannedToday } : task),
  })),
  updateTask: (id, values) => set((state) => ({ tasks: state.tasks.map((task) => task.id === id ? { ...task, ...values } : task) })),
}), { name: "david-hub-tasks", version: 1 }));
