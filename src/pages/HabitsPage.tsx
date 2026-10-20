import { localDate } from "../utils/calendar";
import { useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";
export function HabitsPage() {
  const today = localDate();
  const habits = useHabitStore((state) => state.habits); const addHabit = useHabitStore((state) => state.addHabit);
  const toggleDate = useHabitStore((state) => state.toggleDate); const removeHabit = useHabitStore((state) => state.removeHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const [title, setTitle] = useState(""); const [frequency, setFrequency] = useState("Todos os dias"); const [search, setSearch] = useState("");
  const visibleHabits = habits.filter((habit) => `${habit.title} ${habit.frequency}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  return <section><header className="page-header"><div><h2>Hábitos</h2><p>Acompanhe ações recorrentes separadas dos projetos.</p></div><PageSearch value={search} onChange={setSearch} placeholder="Buscar hábito..." /></header>
    <form className="quick-form" onSubmit={(event) => { event.preventDefault(); if (!title.trim()) return; addHabit({ id: crypto.randomUUID(), title: title.trim(), frequency, history: [] }); setTitle(""); }}>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Estudar 30 minutos" />
      <select value={frequency} onChange={(event) => setFrequency(event.target.value)}><option>Todos os dias</option><option>Dias úteis</option><option>3 vezes por semana</option><option>Semanal</option></select>
      <button type="submit">Criar hábito</button>
    </form><div className="simple-list">{visibleHabits.length === 0 && <p>{habits.length ? "Nenhum hábito encontrado." : "Nenhum hábito cadastrado."}</p>}{visibleHabits.map((habit) => <article key={habit.id}><div><strong>{habit.title}</strong><p>{habit.frequency} • {habit.history.length} registros</p></div><div>
      <button className={habit.history.includes(today) ? "active-action" : ""} onClick={() => toggleDate(habit.id, today)}>{habit.history.includes(today) ? "Feito hoje ✓" : "Marcar hoje"}</button><button onClick={() => { const next = window.prompt("Nome do hábito", habit.title); if (!next?.trim()) return; const nextFrequency = window.prompt("Frequência", habit.frequency); if (nextFrequency?.trim()) updateHabit(habit.id, { title: next.trim(), frequency: nextFrequency.trim() }); }}>Editar</button><ConfirmButton ariaLabel={`Excluir o hábito ${habit.title}`} onConfirm={() => removeHabit(habit.id)} /></div></article>)}</div>
  </section>;
}
