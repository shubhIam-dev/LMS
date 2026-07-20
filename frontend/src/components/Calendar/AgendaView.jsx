import { useMemo } from "react";
import EventCard from "../Schedule/EventCard";

function AgendaView({ events = [] }) {
  const grouped = useMemo(() => {
    const filtered = [...events].filter((e) => e.date >= "2026-07-20");
    const sorted = filtered.sort((a, b) => {
      const da = a.date + "T" + (a.start || "00:00");
      const db = b.date + "T" + (b.start || "00:00");
      return da.localeCompare(db);
    });
    const map = {};
    sorted.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const dates = Object.keys(grouped);

  const formatDate = (d) => {
    const dt = new Date(d + "T00:00:00");
    const today = new Date("2026-07-20T00:00:00");
    const tomorrow = new Date("2026-07-21T00:00:00");
    if (dt.getTime() === today.getTime()) return "Today";
    if (dt.getTime() === tomorrow.getTime()) return "Tomorrow";
    return dt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  if (dates.length === 0) {
    return (
      <div className="agenda-view-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <p>No upcoming events.</p>
      </div>
    );
  }

  return (
    <div className="agenda-view">
      {dates.map((date) => (
        <div key={date} className="agenda-day">
          <div className="agenda-day-header">
            <span className="agenda-day-label">{formatDate(date)}</span>
            <span className="agenda-day-count">{grouped[date].length} event{grouped[date].length > 1 ? "s" : ""}</span>
          </div>
          <div className="agenda-day-events">
            {grouped[date].map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AgendaView;
