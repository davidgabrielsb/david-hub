import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SiteInfoTab { id: string; title: string; content: string; }
export interface SiteListItem { id: string; text: string; done: boolean; }
export interface SiteList { id: string; title: string; items: SiteListItem[]; }
export type MaterialStatus = "pending" | "ordered" | "received";
export interface SiteMaterial { id: string; name: string; quantity: number; unit: string; status: MaterialStatus; notes: string; }
export interface HubSite {
  id: string; name: string; address: string; contact: string; notes: string; projectIds: string[];
  infoTabs: SiteInfoTab[]; lists: SiteList[]; materials: SiteMaterial[]; createdAt: string;
}
interface SiteStore {
  sites: HubSite[];
  addSite: (values: Pick<HubSite, "name" | "address" | "contact" | "notes" | "projectIds">) => string;
  updateSite: (id: string, values: Partial<Omit<HubSite, "id" | "createdAt">>) => void;
  removeSite: (id: string) => void;
  unlinkProject: (projectId: string) => void;
  addInfoTab: (siteId: string, title: string) => string;
  updateInfoTab: (siteId: string, tabId: string, values: Partial<Pick<SiteInfoTab, "title" | "content">>) => void;
  removeInfoTab: (siteId: string, tabId: string) => void;
  addList: (siteId: string, title: string) => void;
  updateList: (siteId: string, listId: string, title: string) => void;
  removeList: (siteId: string, listId: string) => void;
  addListItem: (siteId: string, listId: string, text: string) => void;
  updateListItem: (siteId: string, listId: string, itemId: string, values: Partial<Pick<SiteListItem, "text" | "done">>) => void;
  removeListItem: (siteId: string, listId: string, itemId: string) => void;
  addMaterial: (siteId: string, values: Omit<SiteMaterial, "id">) => void;
  updateMaterial: (siteId: string, materialId: string, values: Omit<SiteMaterial, "id">) => void;
  removeMaterial: (siteId: string, materialId: string) => void;
}
const validMaterial = (material: Omit<SiteMaterial, "id">) => material.name.trim() && Number.isFinite(material.quantity) && material.quantity > 0 && ["pending", "ordered", "received"].includes(material.status);
export const useSiteStore = create<SiteStore>()(persist((set) => {
  const change = (id: string, update: (site: HubSite) => HubSite) => set((state) => ({ sites: state.sites.map((site) => site.id === id ? update(site) : site) }));
  return {
    sites: [],
    addSite: (values) => {
      if (!values.name.trim()) return "";
      const id = crypto.randomUUID();
      set((state) => ({ sites: [...state.sites, { ...values, name: values.name.trim(), projectIds: [...new Set(values.projectIds)], id, createdAt: new Date().toISOString(), infoTabs: [], lists: [], materials: [] }] }));
      return id;
    },
    updateSite: (id, values) => { if (values.name !== undefined && !values.name.trim()) return; change(id, (site) => ({ ...site, ...values, ...(values.name !== undefined ? { name: values.name.trim() } : {}) })); },
    removeSite: (id) => set((state) => ({ sites: state.sites.filter((site) => site.id !== id) })),
    unlinkProject: (projectId) => set((state) => ({ sites: state.sites.map((site) => ({ ...site, projectIds: site.projectIds.filter((id) => id !== projectId) })) })),
    addInfoTab: (id, title) => { if (!title.trim()) return ""; const tabId = crypto.randomUUID(); change(id, (site) => ({ ...site, infoTabs: [...site.infoTabs, { id: tabId, title: title.trim(), content: "" }] })); return tabId; },
    updateInfoTab: (id, tabId, values) => { if (values.title !== undefined && !values.title.trim()) return; change(id, (site) => ({ ...site, infoTabs: site.infoTabs.map((tab) => tab.id === tabId ? { ...tab, ...values } : tab) })); },
    removeInfoTab: (id, tabId) => change(id, (site) => ({ ...site, infoTabs: site.infoTabs.filter((tab) => tab.id !== tabId) })),
    addList: (id, title) => { if (title.trim()) change(id, (site) => ({ ...site, lists: [...site.lists, { id: crypto.randomUUID(), title: title.trim(), items: [] }] })); },
    updateList: (id, listId, title) => { if (title.trim()) change(id, (site) => ({ ...site, lists: site.lists.map((list) => list.id === listId ? { ...list, title: title.trim() } : list) })); },
    removeList: (id, listId) => change(id, (site) => ({ ...site, lists: site.lists.filter((list) => list.id !== listId) })),
    addListItem: (id, listId, text) => { if (text.trim()) change(id, (site) => ({ ...site, lists: site.lists.map((list) => list.id === listId ? { ...list, items: [...list.items, { id: crypto.randomUUID(), text: text.trim(), done: false }] } : list) })); },
    updateListItem: (id, listId, itemId, values) => { if (values.text !== undefined && !values.text.trim()) return; change(id, (site) => ({ ...site, lists: site.lists.map((list) => list.id === listId ? { ...list, items: list.items.map((item) => item.id === itemId ? { ...item, ...values } : item) } : list) })); },
    removeListItem: (id, listId, itemId) => change(id, (site) => ({ ...site, lists: site.lists.map((list) => list.id === listId ? { ...list, items: list.items.filter((item) => item.id !== itemId) } : list) })),
    addMaterial: (id, values) => { if (validMaterial(values)) change(id, (site) => ({ ...site, materials: [...site.materials, { ...values, name: values.name.trim(), id: crypto.randomUUID() }] })); },
    updateMaterial: (id, materialId, values) => { if (validMaterial(values)) change(id, (site) => ({ ...site, materials: site.materials.map((material) => material.id === materialId ? { ...material, ...values, name: values.name.trim() } : material) })); },
    removeMaterial: (id, materialId) => change(id, (site) => ({ ...site, materials: site.materials.filter((material) => material.id !== materialId) })),
  };
}, { name: "david-hub-sites", version: 1 }));
