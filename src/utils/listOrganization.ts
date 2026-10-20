export type SortMode = "default" | "manual" | "az" | "za";
export interface ListPreference { mode: SortMode; ids: string[]; }
const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });

export function organizeItems<T extends { id: string }>(items: T[], label: (item: T) => string, preference?: ListPreference): T[] {
  if (!preference || preference.mode === "default") return items;
  if (preference.mode === "az" || preference.mode === "za") {
    const direction = preference.mode === "az" ? 1 : -1;
    return [...items].sort((a, b) => direction * collator.compare(label(a), label(b)));
  }
  const ranks = new Map(preference.ids.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity));
}

// Update only the visible slots, retaining the order of items hidden by filters.
export function mergeVisibleOrder(saved: string[], visible: string[]): string[] {
  const visibleSet = new Set(visible);
  const base = [...new Set([...saved, ...visible])];
  let cursor = 0;
  return base.map((id) => visibleSet.has(id) ? visible[cursor++] : id);
}

export function moveItem(ids: string[], from: string, to: string, after = false): string[] {
  if (from === to || !ids.includes(from) || !ids.includes(to)) return ids;
  const result = ids.filter((id) => id !== from);
  result.splice(result.indexOf(to) + Number(after), 0, from);
  return result;
}
