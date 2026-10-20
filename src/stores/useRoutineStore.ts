import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RoutineStep { id: string; text: string; }
export interface Routine {
  id: string;
  title: string;
  moment: string;
  active: boolean;
  steps: RoutineStep[];
  completions: Record<string, string[]>;
}
interface RoutineStore {
  routines: Routine[];
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, values: Pick<Routine, "title" | "moment">) => void;
  removeRoutine: (id: string) => void;
  toggleActive: (id: string) => void;
  addStep: (routineId: string, step: RoutineStep) => void;
  updateStep: (routineId: string, stepId: string, text: string) => void;
  removeStep: (routineId: string, stepId: string) => void;
  toggleStep: (routineId: string, stepId: string, date: string) => void;
}
const initialRoutine: Routine = {
  id: "routine-default", title: "Organização diária", moment: "Início do dia", active: true,
  steps: [
    { id: "routine-step-1", text: "Conferir o Dashboard" },
    { id: "routine-step-2", text: "Esvaziar a Caixa de entrada" },
    { id: "routine-step-3", text: "Escolher até cinco tarefas para Meu dia" },
    { id: "routine-step-4", text: "Conferir compromissos e contas" },
  ], completions: {},
};
export const useRoutineStore = create<RoutineStore>()(persist((set) => ({
  routines: [initialRoutine],
  addRoutine: (routine) => set((state) => ({ routines: [...state.routines, routine] })),
  updateRoutine: (id, values) => set((state) => ({ routines: state.routines.map((routine) => routine.id === id ? { ...routine, ...values } : routine) })),
  removeRoutine: (id) => set((state) => ({ routines: state.routines.filter((routine) => routine.id !== id) })),
  toggleActive: (id) => set((state) => ({ routines: state.routines.map((routine) => routine.id === id ? { ...routine, active: !routine.active } : routine) })),
  addStep: (routineId, step) => set((state) => ({ routines: state.routines.map((routine) => routine.id === routineId ? { ...routine, steps: [...routine.steps, step] } : routine) })),
  updateStep: (routineId, stepId, text) => set((state) => ({ routines: state.routines.map((routine) => routine.id === routineId ? { ...routine, steps: routine.steps.map((step) => step.id === stepId ? { ...step, text } : step) } : routine) })),
  removeStep: (routineId, stepId) => set((state) => ({ routines: state.routines.map((routine) => routine.id === routineId ? { ...routine, steps: routine.steps.filter((step) => step.id !== stepId), completions: Object.fromEntries(Object.entries(routine.completions).map(([date, ids]) => [date, ids.filter((id) => id !== stepId)])) } : routine) })),
  toggleStep: (routineId, stepId, date) => set((state) => ({ routines: state.routines.map((routine) => {
    if (routine.id !== routineId) return routine;
    const completed = routine.completions[date] ?? [];
    const next = completed.includes(stepId) ? completed.filter((id) => id !== stepId) : [...completed, stepId];
    return { ...routine, completions: { ...routine.completions, [date]: next } };
  }) })),
}), { name: "david-hub-routines", version: 1 }));
