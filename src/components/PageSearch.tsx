import { useEffect, useRef, useState, type ReactNode } from "react";

interface PageSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

export function PageSearch({ value, onChange, placeholder = "Buscar nesta página...", children }: PageSearchProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return <div className={`page-search ${open ? "open" : ""}`}>
    <button type="button" className="page-search-trigger" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
      <span aria-hidden="true">⌕</span> Buscar{value ? " •" : ""}
    </button>
    {open && <div className="page-search-panel">
      <div className="page-search-input-row">
        <input ref={inputRef} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        {value && <button type="button" onClick={() => onChange("")}>Limpar</button>}
      </div>
      {children}
    </div>}
  </div>;
}
