import LectureCard from "./LectureCard";

const typeColors = {
  Theory: { bg: "var(--primary-100)", color: "var(--primary-600)" },
  Lab: { bg: "var(--success-soft)", color: "var(--success)" },
  Exam: { bg: "var(--danger-soft)", color: "var(--danger)" },
  Tutorial: { bg: "var(--amber-soft)", color: "var(--amber-600)" },
};

function DaySchedule({ date, lectures, showFaculty = true, showStudents = false }) {
  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Group lectures by type
  const grouped = {};
  lectures.forEach((l) => {
    const type = l.type || "Theory";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(l);
  });

  const typeOrder = ["Theory", "Lab", "Tutorial", "Exam"];

  return (
    <div className="day-schedule">
      <div className="day-schedule-header">
        <span className="day-schedule-date">{formatDateHeader(date)}</span>
        <span className="day-schedule-count">
          {lectures.length} lecture{lectures.length !== 1 ? "s" : ""}
        </span>
      </div>

      {lectures.length > 0 ? (
        <div className="day-schedule-body">
          {typeOrder.map((type) => {
            const items = grouped[type];
            if (!items || items.length === 0) return null;
            const style = typeColors[type] || typeColors.Theory;

            return (
              <div key={type} className="day-schedule-group">
                <div className="day-schedule-group-header" style={{ background: style.bg, color: style.color }}>
                  <span className="day-schedule-group-dot" style={{ background: style.color }} />
                  {type}
                  <span className="day-schedule-group-count">{items.length}</span>
                </div>
                {items.map((lecture) => (
                  <LectureCard
                    key={lecture.id}
                    lecture={lecture}
                    showFaculty={showFaculty}
                    showStudents={showStudents}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="day-schedule-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
          </svg>
          <p>No lectures scheduled for this day.</p>
        </div>
      )}
    </div>
  );
}

export default DaySchedule;
