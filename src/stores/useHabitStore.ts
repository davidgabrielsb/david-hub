import { create } from "zustand";
import { persist } from "zustand/middleware";
export interface Habit { id: string; title: string; frequency: string; history: string[]; }
interface HabitStore { habits: Habit[]; addHabit: (habit: Habit) => void; removeHabit: (id: string) => void; updateHabit: (id: string, values: Partial<Omit<Habit, "id" | "history">>) => void; toggleDate: (id: string, date: string) => void; }
export const useHabitStore = create<HabitStore>()(persist((set) => ({
  habits: [],
  addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
  removeHabit: (id) => set((state) => ({ habits: state.habits.filter((habit) => habit.id !== id) })),
  updateHabit: (id, values) => set((state) => ({ habits: state.habits.map((habit) => habit.id === id ? { ...habit, ...values } : habit) })),
  toggleDate: (id, date) => set((state) => ({ habits: state.habits.map((habit) => habit.id !== id ? habit : ({ ...habit, history: habit.history.includes(date) ? habit.history.filter((entry) => entry !== date) : [...habit.history, date] })) })),
}), { name: "david-hub-habits", version: 1 }));
