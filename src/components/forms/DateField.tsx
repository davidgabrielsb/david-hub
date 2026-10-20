interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateField({
  value,
  onChange,
}: DateFieldProps) {
  function setToday() {
    onChange(formatDate(new Date()));
  }

  function setTomorrow() {
    const date = new Date();

    date.setDate(date.getDate() + 1);

    onChange(formatDate(date));
  }

  function setNextWeek() {
    const date = new Date();

    date.setDate(date.getDate() + 7);

    onChange(formatDate(date));
  }

  function clearDate() {
    onChange("");
  }

  return (
    <div className="date-field">
      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />

      <div className="date-shortcuts">
        <button
          type="button"
          onClick={setToday}
        >
          Hoje
        </button>

        <button
          type="button"
          onClick={setTomorrow}
        >
          Amanhã
        </button>

        <button
          type="button"
          onClick={setNextWeek}
        >
          +7 dias
        </button>

        {value && (
          <button
            type="button"
            onClick={clearDate}
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}