import { useState, useMemo } from "react";
import CalendarDay from "./CalendarDay";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AcademicCalendar({
  lectureDates = [],
  selectedDate,
  onDateSelect,
  compact = true,
}) {
  const today = "2026-07-20"; // static for mock context
  const todayDate = new Date(today);

  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(todayDate.getMonth());
    setCurrentYear(todayDate.getFullYear());
    onDateSelect(today);
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayIndex = firstDayOfMonth.getDay();

    const days = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({ day, date, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({ day, date, isCurrentMonth: true });
    }

    // Next month filler days to complete the grid (42 cells = 6 rows)
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const date = `${currentYear}-${String(currentMonth + 2).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({ day, date, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  const lectureDateSet = useMemo(
    () => new Set(lectureDates),
    [lectureDates]
  );

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const isToday = (date) => date === today;

  return (
    <div className={`academic-calendar ${compact ? "cal--compact" : "cal--full"}`}>
      {/* Header */}
      <div className="cal-header">
        <button
          className="cal-nav-btn"
          onClick={goToPrevMonth}
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className="cal-month-label">{monthName}</span>
        <button
          className="cal-nav-btn"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Today button */}
      <button className="cal-today-btn" onClick={goToToday}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
        </svg>
        Today
      </button>

      {/* Day headers */}
      <div className="cal-day-headers">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="cal-day-header">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="cal-grid">
        {calendarDays.map(({ day, date, isCurrentMonth }) => (
          <CalendarDay
            key={date}
            day={day}
            date={date}
            isCurrentMonth={isCurrentMonth}
            isToday={isToday(date)}
            isSelected={selectedDate === date}
            hasLecture={lectureDateSet.has(date)}
            onClick={() => onDateSelect(date)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-legend-item">
          <span className="cal-dot cal-dot--lecture" />
          Lecture
        </span>
        <span className="cal-legend-item">
          <span className="cal-dot cal-dot--lab" />
          Lab
        </span>
        <span className="cal-legend-item">
          <span className="cal-dot cal-dot--exam" />
          Exam
        </span>
      </div>
    </div>
  );
}

export default AcademicCalendar;
