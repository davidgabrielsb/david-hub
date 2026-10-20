import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  area: "work" | "study" | "personal";
}

interface EventStore {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, values: Partial<Omit<CalendarEvent, "id">>) => void;
}

export const useEventStore = create<EventStore>()(
  persist((set) => ({
    events: [],
    addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
    removeEvent: (id) => set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),
    updateEvent: (id, values) => set((state) => ({ events: state.events.map((event) => event.id === id ? { ...event, ...values } : event) })),
  }), { name: "david-hub-events", version: 1 }),
);
