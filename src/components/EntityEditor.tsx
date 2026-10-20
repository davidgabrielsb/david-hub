import { useState } from "react";
import { HubDialog } from "./HubDialog";

export interface EditorField {
  name: string; label: string; type?: "text" | "textarea" | "date" | "time" | "number" | "select" | "checkbox";
  required?: boolean; min?: number; max?: number; step?: string;
  options?: readonly (string | { value: string; label: string })[];
}
export type EditorValues = Record<string, string>;
export function EntityEditor({ title, fields, initial, onSave, onClose, validate }: {
  title: string; fields: EditorField[]; initial: Record<string, unknown>;
  onSave: (values: EditorValues) => void; onClose: () => void; validate?: (values: EditorValues) => string | undefined;
}) {
  const [draft, setDraft] = useState<EditorValues>(() => Object.fromEntries(fields.map(({ name }) => [name, String(initial[name] ?? "")])));
  const [error, setError] = useState("");
  return <HubDialog title={title} onClose={onClose}><form className="entity-editor-form" onSubmit={(event) => {
    event.preventDefault();
    const values = Object.fromEntries(Object.entries(draft).map(([name, value]) => [name, value.trim()]));
    if (fields.some((field) => field.required && !values[field.name])) { setError("Preencha os campos obrigatórios."); return; }
    const message = validate?.(values);
    if (message) { setError(message); return; }
    onSave(values); onClose();
  }}>{fields.map((field, index) => {
    const common = { name: field.name, required: field.required, autoFocus: index === 0, value: draft[field.name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDraft({ ...draft, [field.name]: event.target.value }) };
    return <label key={field.name}>{field.label}{field.required ? " *" : ""}{field.type === "textarea" ? <textarea {...common} rows={5} /> : field.type === "select" ? <select {...common}>{field.options?.map((option) => typeof option === "string" ? <option key={option} value={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "checkbox" ? <input name={field.name} type="checkbox" checked={draft[field.name] === "true"} onChange={(event) => setDraft({ ...draft, [field.name]: String(event.target.checked) })} /> : <input {...common} type={field.type ?? "text"} min={field.min} max={field.max} step={field.step} />}</label>;
  })}{error && <p className="editor-error" role="alert">{error}</p>}<footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="editor-save">Salvar alterações</button></footer></form></HubDialog>;
}
