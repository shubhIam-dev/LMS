import { useMemo } from "react";
import { getColorForCategory } from "../../data/calendarEvents";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthView({ currentMonth, currentYear, events, selectedDate, onDateSelect }) {
  const today = "2026-07-20";

  const [days, eventMap] = useMemo(() => {
    const first = new Date(currentYear, currentMonth, 1).getDay();
    const daysIn = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevDays = new Date(currentYear, currentMonth, 0).getDate();

    const map = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });

    const cells = [];
    for (let i = 0; i < first; i++) {
      const d = prevDays - first + i + 1;
      cells.push({ day: d, date: `${currentYear}-${String(currentMonth).padStart(2,"0")}-${String(d).padStart(2,"0")}`, muted: true, events: [] });
    }
    for (let d = 1; d <= daysIn; d++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      cells.push({ day: d, date, muted: false, events: map[date] || [] });
    }
    const rem = 42 - cells.length;
    for (let d = 1; d <= rem; d++) {
      cells.push({ day: d, date: `${currentYear}-${String(currentMonth + 2).padStart(2,"0")}-${String(d).padStart(2,"0")}`, muted: true, events: [] });
    }
    return [cells, map];
  }, [events, currentMonth, currentYear]);

  return (
    <div className="month-view">
      <div className="month-view-headers">
        {DAYS.map((d) => <div key={d} className="month-view-header">{d}</div>)}
      </div>
      <div className="month-view-grid">
        {days.map(({ day, date, muted, events: cellEvents }) => (
          <button
            key={date}
            className={`month-view-cell ${muted ? "muted" : ""} ${date === today ? "is-today" : ""} ${date === selectedDate ? "is-selected" : ""}`}
            onClick={() => onDateSelect(date)}
          >
            <span className="month-view-num">{day}</span>
            <div className="month-view-events">
              {cellEvents.slice(0, 2).map((e) => (
                <div key={e.id} className="month-view-event" style={{ background: getColorForCategory(e.category) }}>
                  {e.title}
                </div>
              ))}
              {cellEvents.length > 2 && <div className="month-view-more">+{cellEvents.length - 2} more</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MonthView;
