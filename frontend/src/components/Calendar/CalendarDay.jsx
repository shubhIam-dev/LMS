function CalendarDay({
  day,
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  hasLecture,
  onClick,
}) {
  return (
    <button
      className={`cal-day ${isCurrentMonth ? "" : "cal-day--muted"} ${isToday ? "cal-day--today" : ""} ${isSelected ? "cal-day--selected" : ""} ${hasLecture ? "cal-day--has-lecture" : ""}`}
      onClick={onClick}
      aria-label={`${date}${hasLecture ? " (has lectures)" : ""}`}
    >
      <span className="cal-day-number">{day}</span>
      {hasLecture && <span className="cal-day-dot" />}
    </button>
  );
}

export default CalendarDay;
