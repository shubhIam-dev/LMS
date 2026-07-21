import { useMemo } from "react";
import EventCard from "./EventCard";

function UpcomingEvents({ events = [] }) {
  const sorted = useMemo(() => {
    return [...events]
      .filter((e) => e.date >= "2026-07-20")
      .sort((a, b) => {
        const da = a.date + "T" + (a.start || "00:00");
        const db = b.date + "T" + (b.start || "00:00");
        return da.localeCompare(db);
      })
      .slice(0, 5);
  }, [events]);

  if (sorted.length === 0) {
    return (
      <div className="upcoming-events">
        <div className="dash-card-header">
          <span className="dash-card-title">Upcoming Events</span>
          <span className="dash-card-count">0</span>
        </div>
        <div className="upcoming-events-empty">No upcoming events.</div>
      </div>
    );
  }

  return (
    <div className="upcoming-events">
      <div className="dash-card-header">
        <span className="dash-card-title">Upcoming Events</span>
        <span className="dash-card-count">{sorted.length}</span>
      </div>
      <div className="upcoming-events-body">
        {sorted.map((event) => (
          <EventCard key={event.id} event={event} compact />
        ))}
      </div>
    </div>
  );
}

export default UpcomingEvents;
