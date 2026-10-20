import { useSearchParams } from "react-router-dom";
import type { TaskArea } from "../stores/useTaskStore";

export type AreaSelection = "all" | TaskArea;
export const lifeAreas: { value: AreaSelection; label: string }[] = [
  { value: "all", label: "Todas" }, { value: "work", label: "Trabalho" },
  { value: "study", label: "Estudos" }, { value: "personal", label: "Pessoal" },
];
export function matchesArea(area: TaskArea, selected: AreaSelection) {
  return selected === "all" || area === selected;
}
export function useAreaFilter() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("area");
  const selected: AreaSelection = requested === "work" || requested === "study" || requested === "personal" ? requested : "all";
  function select(area: AreaSelection) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (area === "all") next.delete("area"); else next.set("area", area);
      return next;
    }, { replace: true, preventScrollReset: true });
  }
  return { selected, select };
}
export function AreaFilter({ value, onChange }: { value: AreaSelection; onChange: (area: AreaSelection) => void }) {
  return <div className="task-filters life-area-filters" role="group" aria-label="Filtrar por área da vida">{lifeAreas.map((area) => <button type="button" key={area.value} className={value === area.value ? "active" : ""} aria-pressed={value === area.value} onClick={() => onChange(area.value)}>{area.label}</button>)}</div>;
}
