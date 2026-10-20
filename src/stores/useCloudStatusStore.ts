import { create } from "zustand";
export const useCloudStatusStore = create<{ sitesReady: boolean | null; setSitesReady: (ready: boolean | null) => void }>((set) => ({ sitesReady: null, setSitesReady: (sitesReady) => set({ sitesReady }) }));
