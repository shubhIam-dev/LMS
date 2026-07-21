import { getColorForCategory } from "../../data/calendarEvents";

const categoryLabels = {
  lecture: "Lecture",
  lab: "Lab",
  exam: "Exam",
  assignment: "Assignment",
  tutorial: "Tutorial",
  holiday: "Holiday",
};

function EventCard({ event, compact = false }) {
  const color = getColorForCategory(event.category);
  const badgeBg = {
    lecture: "var(--primary-100)", lab: "var(--success-soft)", exam: "var(--danger-soft)",
    assignment: "var(--amber-soft)", tutorial: "var(--info-soft)", holiday: "var(--warning-soft)",
  }[event.category] || "var(--paper-2)";
  const badgeColor = {
    lecture: "var(--primary-600)", lab: "var(--success)", exam: "var(--danger)",
    assignment: "var(--amber-600)", tutorial: "var(--info)", holiday: "var(--warning)",
  }[event.category] || "var(--muted)";

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const timeStr = event.start ? `${formatTime(event.start)}${event.end ? ` — ${formatTime(event.end)}` : ""}` : "All day";

  return (
    <div className={`ev-card ${compact ? "ev-card--compact" : ""}`} style={{ borderLeftColor: color }}>
      <div className="ev-card-left">
        <span className="ev-card-badge" style={{ background: badgeBg, color: badgeColor }}>
          {categoryLabels[event.category] || event.type}
        </span>
        <span className="ev-card-time">{timeStr}</span>
      </div>
      <h4 className="ev-card-title">{event.title}</h4>
      {(event.faculty || event.room) && (
        <div className="ev-card-meta">
          {event.faculty && <span>{event.faculty}</span>}
          {event.room && <span>{event.room}</span>}
          {event.semester && <span>Sem {event.semester} · {event.section}</span>}
        </div>
      )}
    </div>
  );
}

export default EventCard;
