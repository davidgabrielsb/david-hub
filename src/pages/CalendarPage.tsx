import { useState } from "react";

import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { ConfirmButton } from "../components/ConfirmButton";
import { useEventStore, type CalendarEvent } from "../stores/useEventStore";
import { PageSearch } from "../components/PageSearch";

const monthFormatter = new Intl.DateTimeFormat(
  "pt-BR",
  {
    month: "long",
    year: "numeric",
  },
);

export function CalendarPage() {
  const events = useEventStore((state) => state.events);
  const addEvent = useEventStore((state) => state.addEvent);
  const removeEvent = useEventStore((state) => state.removeEvent);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [area, setArea] = useState<CalendarEvent["area"]>("personal");
  const [search, setSearch] = useState("");
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ),
  );

  function previousMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1,
      ),
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
      ),
    );
  }

  function goToToday() {
    const now = new Date();

    setCurrentDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    );
  }

  const visibleEvents = events.filter((event) => `${event.title} ${event.area} ${event.date}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));

  return (
    <section>
      <header className="calendar-page-header">
        <div className="calendar-navigation">
          <button
            type="button"
            onClick={previousMonth}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={goToToday}
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={nextMonth}
          >
            ›
          </button>
        </div>

        <h2 className="calendar-title">
          {monthFormatter.format(currentDate)}
        </h2>
        <PageSearch value={search} onChange={setSearch} placeholder="Buscar compromisso..." />
      </header>

      <CalendarGrid
        year={currentDate.getFullYear()}
        month={currentDate.getMonth()}
      />
      <div className="calendar-entry">
        <h3>Datas importantes</h3>
        <form onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim() || !date) return;
          addEvent({ id: crypto.randomUUID(), title: title.trim(), date, time: time || undefined, area });
          setTitle(""); setDate(""); setTime("");
        }}>
          <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
          <label>Data<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label>Hora<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
          <label>Área<select value={area} onChange={(event) => setArea(event.target.value as CalendarEvent["area"])}>
            <option value="work">Trabalho</option><option value="study">Estudos</option><option value="personal">Pessoal</option>
          </select></label>
          <button type="submit">Adicionar data</button>
        </form>
        {visibleEvents.length === 0 ? <p>{events.length ? "Nenhuma data encontrada." : "Nenhuma data cadastrada."}</p> : (
          <ul>{[...visibleEvents].sort((a, b) => a.date.localeCompare(b.date)).map((event) => (
            <li key={event.id}>{event.date.split("-").reverse().join("/")} • {event.title}
              <button type="button" onClick={() => { const next = window.prompt("Título", event.title); if (!next?.trim()) return; const nextDate = window.prompt("Data no formato AAAA-MM-DD", event.date); if (!nextDate) return; updateEvent(event.id, { title: next.trim(), date: nextDate }); }}>Editar</button>
              <ConfirmButton ariaLabel={`Excluir ${event.title}`} onConfirm={() => removeEvent(event.id)} />
            </li>
          ))}</ul>
        )}
      </div>
    </section>
  );
}
