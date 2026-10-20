import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecordArea = "work" | "study" | "personal";

export interface HubRecord {
  id: string;
  area: RecordArea;
  category: string;
  title: string;
  details: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

interface RecordStore {
  records: HubRecord[];
  addRecord: (record: HubRecord) => void;
  toggleRecord: (id: string) => void;
  removeRecord: (id: string) => void;
  updateRecord: (id: string, values: Partial<Omit<HubRecord, "id" | "createdAt">>) => void;
}

export const useRecordStore = create<RecordStore>()(persist((set) => ({
  records: [],
  addRecord: (record) => set((state) => ({ records: [...state.records, record] })),
  toggleRecord: (id) => set((state) => ({ records: state.records.map((record) =>
    record.id === id ? { ...record, completed: !record.completed } : record,
  ) })),
  removeRecord: (id) => set((state) => ({ records: state.records.filter((record) => record.id !== id) })),
  updateRecord: (id, values) => set((state) => ({ records: state.records.map((record) => record.id === id ? { ...record, ...values } : record) })),
}), { name: "david-hub-records", version: 1 }));
