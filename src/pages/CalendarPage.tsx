import { useState } from "react";

import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { ConfirmButton } from "../components/ConfirmButton";
import { useEventStore, type CalendarEvent } from "../stores/useEventStore";
import { PageSearch } from "../components/PageSearch";
import { EntityEditor } from "../components/EntityEditor";
import { OrganizedList } from "../components/ListOrganization";

const monthFormatter = new Intl.DateTimeFormat(
  "pt-BR",
  {
    month: "long",
    year: "numeric",
  },
);

export function CalendarPage() {
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
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
          <OrganizedList collection="events:items" items={[...visibleEvents].sort((a, b) => a.date.localeCompare(b.date))} label={(event) => event.title} name="datas" className="simple-list">{(event) => (
            <article>{event.date.split("-").reverse().join("/")} {event.time} • {event.title}
              <button type="button" onClick={() => setEditing(event)}>Editar</button>
              <ConfirmButton ariaLabel={`Excluir ${event.title}`} onConfirm={() => removeEvent(event.id)} />
            </article>
          )}</OrganizedList>
        )}
      </div>
      {editing && <EntityEditor key={editing.id} title="Editar compromisso" initial={{ title: editing.title, date: editing.date, time: editing.time, area: editing.area }} fields={[{ name: "title", label: "Título", required: true }, { name: "date", label: "Data", type: "date", required: true }, { name: "time", label: "Hora", type: "time" }, { name: "area", label: "Área", type: "select", options: [{ value: "work", label: "Trabalho" }, { value: "study", label: "Estudos" }, { value: "personal", label: "Pessoal" }] }]} onSave={(values) => updateEvent(editing.id, { title: values.title, date: values.date, time: values.time || undefined, area: values.area as CalendarEvent["area"] })} onClose={() => setEditing(null)} />}
    </section>
  );
}
