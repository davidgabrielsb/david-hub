import { createCalendarMonth } from "../../utils/calendar";

import { useTaskStore } from "../../stores/useTaskStore";
import { useEventStore } from "../../stores/useEventStore";
import { useRecordStore } from "../../stores/useRecordStore";
import { getProjectProgress } from "../../features/projects/progress";
import { useFinanceStore } from "../../stores/useFinanceStore";

const weekDays = [
  "dom.",
  "seg.",
  "ter.",
  "qua.",
  "qui.",
  "sex.",
  "sáb.",
];

interface CalendarGridProps {
  year: number;
  month: number;
}

export function CalendarGrid({
  year,
  month,
}: CalendarGridProps) {
  const days = createCalendarMonth(year, month);

  const tasks = useTaskStore((state) => state.tasks);
  const events = useEventStore((state) => state.events);
  const records = useRecordStore((state) => state.records);
  const bills = useFinanceStore((state) => state.bills);

  return (
    <div className="calendar">
      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div
            key={day}
            className="calendar-weekday"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const dateKey = formatDateKey(day.date);

          const dayTasks = tasks.filter(
            (task) => task.deadline === dateKey,
          );
          const dayEvents = events.filter((event) => event.date === dateKey);
          const dayRecords = records.filter((record) => !getProjectProgress(record, tasks).isComplete && record.dueDate === dateKey);
          const dayBills = bills.filter((bill) => !bill.paid && bill.dueDate === dateKey);

          return (
            <div
              key={day.date.toISOString()}
              className={
                day.isCurrentMonth
                  ? "calendar-day"
                  : "calendar-day outside-month"
              }
            >
              <div className="calendar-day-header">
                <span
                  className={
                    day.isToday
                      ? "calendar-day-number today"
                      : "calendar-day-number"
                  }
                >
                  {day.date.getDate()}
                </span>
              </div>

              <div className="calendar-events">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`calendar-event ${task.area}`}
                  >
                    {task.time && (
                      <span className="calendar-event-time">
                        {task.time}
                      </span>
                    )}

                    <span>
                      {task.title}
                    </span>
                  </div>
                ))}
                {dayEvents.map((event) => (
                  <div key={event.id} className={`calendar-event ${event.area}`}>
                    {event.time && <span className="calendar-event-time">{event.time}</span>}
                    <span>{event.title}</span>
                  </div>
                ))}
                {dayRecords.map((record) => (
                  <div key={record.id} className={`calendar-event ${record.area}`}>
                    <span>{record.title}</span>
                  </div>
                ))}
                {dayBills.map((bill) => <div key={bill.id} className="calendar-event personal"><span>Conta: {bill.title}</span></div>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
