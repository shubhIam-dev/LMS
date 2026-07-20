import { useMemo } from "react";
import EventCard from "../Schedule/EventCard";
import UpcomingEvents from "../Schedule/UpcomingEvents";

function CalendarSidebar({ selectedDate, events, isStaff, onAddLecture }) {
  const dayEvents = useMemo(() => events.filter((e) => e.date === selectedDate), [events, selectedDate]);

  const dayInfo = useMemo(() => {
    const d = new Date(selectedDate + "T00:00:00");
    return {
      name: d.toLocaleDateString("en-US", { weekday: "long" }),
      date: d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
  }, [selectedDate]);

  return (
    <div className="cal-sidebar">
      {/* Selected Day */}
      <div className="cal-sidebar-day">
        <span className="cal-sidebar-day-name">{dayInfo.name}</span>
        <span className="cal-sidebar-day-date">{dayInfo.date}</span>
        <span className="cal-sidebar-day-count">{dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Add Lecture (faculty) */}
      {isStaff && (
        <button className="cal-sidebar-add-btn" onClick={onAddLecture}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M12 5v14" /><path d="M5 12h14" />
          </svg>
          Schedule Lecture
        </button>
      )}

      {/* Day Events */}
      {dayEvents.length > 0 && (
        <div className="cal-sidebar-section">
          <h3 className="cal-sidebar-section-title">Schedule</h3>
          <div className="cal-sidebar-events">
            {dayEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="cal-sidebar-section">
        <UpcomingEvents events={events} />
      </div>
    </div>
  );
}

export default CalendarSidebar;
