import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ListPreference } from "../utils/listOrganization";

interface OrganizationStore {
  lists: Record<string, ListPreference>;
  save: (key: string, preference: ListPreference) => void;
}
export const useListOrganizationStore = create<OrganizationStore>()(persist((set) => ({
  lists: {},
  save: (key, preference) => set((state) => ({ lists: { ...state.lists, [key]: preference } })),
}), { name: "david-hub-organization", version: 1 }));
