import { useEffect, useRef, type ReactNode } from "react";
export function HubDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!; dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="quick-modal hub-dialog" aria-label={title} onCancel={onClose}>
    <header><h3>{title}</h3><button type="button" aria-label="Fechar janela" onClick={onClose}>×</button></header>{children}
  </dialog>;
}
