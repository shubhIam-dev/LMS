import { useState, useMemo } from "react";
import { getColorForCategory } from "../../data/calendarEvents";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function MiniCalendar({ events = [], selectedDate, onDateSelect }) {
  const today = "2026-07-20";
  const [month, setMonth] = useState(6); // July
  const [year, setYear] = useState(2026);

  const goBack = () => setMonth((m) => (m === 0 ? (setYear((y) => y - 1), 11) : m - 1));
  const goForward = () => setMonth((m) => (m === 11 ? (setYear((y) => y + 1), 0) : m + 1));

  const days = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const daysIn = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const map = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });

    const cells = [];
    for (let i = 0; i < first; i++) {
      const d = prevDays - first + i + 1;
      const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date, muted: true, events: map[date] || [] });
    }
    for (let d = 1; d <= daysIn; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date, muted: false, events: map[date] || [] });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const date = `${year}-${String(month + 2).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date, muted: true, events: map[date] || [] });
    }
    return cells;
  }, [events, month, year]);

  return (
    <div className="mini-calendar">
      <div className="mini-cal-header">
        <button className="mini-cal-nav" onClick={goBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <span className="mini-cal-label">
          {new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button className="mini-cal-nav" onClick={goForward}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
      <div className="mini-cal-days">
        {DAYS.map((d) => (
          <div key={d} className="mini-cal-day-header">{d}</div>
        ))}
        {days.map(({ day, date, muted, events: cellEvents }) => (
          <button
            key={date}
            className={`mini-cal-cell ${muted ? "muted" : ""} ${date === today ? "today" : ""} ${date === selectedDate ? "selected" : ""}`}
            onClick={() => onDateSelect(date)}
          >
            <span className="mini-cal-num">{day}</span>
            {cellEvents.length > 0 && (
              <div className="mini-cal-dots">
                {cellEvents.slice(0, 3).map((e, i) => (
                  <span key={i} className="mini-cal-dot" style={{ background: getColorForCategory(e.category) }} />
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MiniCalendar;
