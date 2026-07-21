import { useMemo } from "react";
import { getWeekDates, getColorForCategory } from "../../data/calendarEvents";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

function WeekView({ currentDate, events, selectedDate, onDateSelect }) {
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const eventMap = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const today = "2026-07-20";
  const days = weekDates.map((d) => {
    const dt = new Date(d + "T00:00:00");
    return { date: d, label: dt.toLocaleDateString("en-US", { weekday: "short" }), num: dt.getDate(), isToday: d === today, events: eventMap[d] || [] };
  });

  const getEventStyle = (event) => {
    if (!event.start) return {};
    const [sh, sm] = event.start.split(":").map(Number);
    const [eh, em] = (event.end || event.start).split(":").map(Number);
    const startMin = (sh - 8) * 60 + sm;
    const endMin = (eh - 8) * 60 + em;
    const topPct = (startMin / 660) * 100;
    const heightPct = Math.max(((endMin - startMin) / 660) * 100, 2.5);
    return {
      top: `${topPct}%`,
      height: `${heightPct}%`,
      background: getColorForCategory(event.category),
    };
  };

  return (
    <div className="week-view">
      <div className="week-view-header">
        <div className="week-view-corner">
          <span className="week-view-gmt">IST</span>
        </div>
        {days.map((d) => (
          <button
            key={d.date}
            className={`week-view-day-header ${d.isToday ? "today" : ""} ${d.date === selectedDate ? "selected" : ""}`}
            onClick={() => onDateSelect(d.date)}
          >
            <span className="week-view-day-label">{d.label}</span>
            <span className="week-view-day-num">{d.num}</span>
          </button>
        ))}
      </div>
      <div className="week-view-body">
        <div className="week-view-times">
          {HOURS.map((h) => (
            <div key={h} className="week-view-time">{h > 12 ? `${h - 12}` : h}:00 <span className="week-view-ampm">{h >= 12 ? "PM" : "AM"}</span></div>
          ))}
        </div>
        <div className="week-view-columns">
          {days.map((d) => (
            <div key={d.date} className={`week-view-col ${d.isToday ? "today" : ""}`}>
              <div className="week-view-gridlines">
                {HOURS.map((h) => <div key={h} className="week-view-hourline" />)}
              </div>
              <div className="week-view-events-layer">
                {d.events.map((e) => (
                  <div key={e.id} className="week-view-event-block" style={getEventStyle(e)} title={`${e.title} - ${e.faculty || ""}`}>
                    <span className="wveb-title">{e.title}</span>
                    <span className="wveb-time">{e.start}{e.end ? ` - ${e.end}` : ""}</span>
                    {e.room && <span className="wveb-room">{e.room}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
