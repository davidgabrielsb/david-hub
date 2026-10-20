import { useId, useState, type DragEvent, type ReactNode } from "react";
import { useListOrganizationStore } from "../stores/useListOrganizationStore";
import { mergeVisibleOrder, moveItem, organizeItems, type SortMode } from "../utils/listOrganization";

const dragType = "application/x-david-hub-item";
export function useListOrganization<T extends { id: string }>(key: string, items: T[], label: (item: T) => string) {
  const preference = useListOrganizationStore((state) => state.lists[key]);
  const save = useListOrganizationStore((state) => state.save);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const ordered = organizeItems(items, label, preference);
  function move(from: string, to: string, after = false) {
    const ids = ordered.map((item) => item.id);
    if (from === to || !ids.includes(from) || !ids.includes(to)) return;
    const next = moveItem(ids, from, to, after);
    save(key, { mode: "manual", ids: mergeVisibleOrder(preference?.ids ?? [], next) });
    setAnnouncement(`${label(ordered.find((item) => item.id === from)!)} movido para a posição ${next.indexOf(from) + 1}.`);
  }
  return {
    items: ordered, mode: preference?.mode ?? "default", announcement,
    setMode(mode: SortMode) { save(key, { mode, ids: preference?.ids ?? [] }); },
    moveBy(id: string, delta: number) {
      const index = ordered.findIndex((item) => item.id === id);
      const target = ordered[index + delta];
      if (target) move(id, target.id, delta > 0);
    },
    handleProps(id: string) {
      return {
        draggable: true,
        onDragStart(event: DragEvent) { event.stopPropagation(); event.dataTransfer.setData(dragType, JSON.stringify({ key, id })); event.dataTransfer.effectAllowed = "move"; setDragging(id); },
        onDragEnd() { setDragging(null); setOver(null); },
      };
    },
    dropProps(id: string) {
      return {
        "data-order-over": over === id || undefined,
        "data-order-dragging": dragging === id || undefined,
        onDragOver(event: DragEvent) { if (!event.dataTransfer.types.includes(dragType)) return; event.stopPropagation(); event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOver(id); },
        onDragLeave(event: DragEvent<HTMLElement>) { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(null); },
        onDrop(event: DragEvent<HTMLElement>) {
          if (!event.dataTransfer.types.includes(dragType)) return;
          event.preventDefault(); event.stopPropagation(); setDragging(null); setOver(null);
          try {
            const data = JSON.parse(event.dataTransfer.getData(dragType));
            if (data.key !== key || typeof data.id !== "string") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            move(data.id, id, event.clientY > bounds.top + bounds.height / 2);
          } catch { /* Ignore drops from other applications. */ }
        },
      };
    },
  };
}

type ListController = ReturnType<typeof useListOrganization<{ id: string }>>;
export function ListOrderToolbar({ list, label = "lista" }: { list: ListController; label?: string }) {
  const id = useId();
  return <div className="list-order-toolbar"><label htmlFor={id}>Organizar {label}</label><select id={id} value={list.mode} onChange={(event) => list.setMode(event.target.value as SortMode)}><option value="default">Ordem padrão</option><option value="az">Nome: A → Z</option><option value="za">Nome: Z → A</option><option value="manual">Minha ordem</option></select><small>Arraste pelo ⠿ ou use as setas.</small><span className="sr-only" role="status" aria-live="polite">{list.announcement}</span></div>;
}
export function ListOrderHandle({ list, id, label }: { list: ListController; id: string; label: string }) {
  const index = list.items.findIndex((item) => item.id === id);
  return <span className="list-order-handle" onClick={(event) => event.stopPropagation()}><button type="button" {...list.handleProps(id)} aria-label={`Arrastar ${label}. Use Alt e setas para mover.`} title="Arraste para reorganizar; Alt + ↑ ou ↓ pelo teclado" onKeyDown={(event) => { if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) { event.preventDefault(); list.moveBy(id, event.key === "ArrowUp" ? -1 : 1); } }}>⠿</button><button type="button" aria-label={`Mover ${label} para cima`} disabled={index === 0} onClick={() => list.moveBy(id, -1)}>↑</button><button type="button" aria-label={`Mover ${label} para baixo`} disabled={index === list.items.length - 1} onClick={() => list.moveBy(id, 1)}>↓</button></span>;
}

export function OrganizedList<T extends { id: string }>({ collection, items, label, className, children, name = "lista" }: {
  collection: string; items: T[]; label: (item: T) => string; className?: string; name?: string; children: (item: T) => ReactNode;
}) {
  const list = useListOrganization(collection, items, label);
  return <div className="organized-list"><ListOrderToolbar list={list} label={name} /><div className={className}>{list.items.map((item) => <div className="organized-item" key={item.id} {...list.dropProps(item.id)}><div className="organized-item-controls"><ListOrderHandle list={list} id={item.id} label={label(item)} /></div>{children(item)}</div>)}</div></div>;
}
