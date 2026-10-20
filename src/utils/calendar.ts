export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function createCalendarMonth(
  year: number,
  month: number,
): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);

  const firstWeekDay = firstDayOfMonth.getDay();

  const today = new Date();

  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index++) {
    const dayNumber = index - firstWeekDay + 1;

    const date = new Date(
      year,
      month,
      dayNumber,
    );

    const isCurrentMonth =
      date.getMonth() === month;

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    days.push({
      date,
      isCurrentMonth,
      isToday,
    });
  }

  return days;
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
