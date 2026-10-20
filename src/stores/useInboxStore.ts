import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface InboxItem { id: string; text: string; createdAt: string; }
interface InboxStore {
  items: InboxItem[];
  addItem: (text: string) => void;
  removeItem: (id: string) => void;
}
export const useInboxStore = create<InboxStore>()(persist((set) => ({
  items: [],
  addItem: (text) => set((state) => ({ items: [...state.items, { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}), { name: "david-hub-inbox", version: 1 }));
