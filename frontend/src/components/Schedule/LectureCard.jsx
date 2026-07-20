const typeColors = {
  Theory: { bg: "var(--primary-100)", color: "var(--primary-600)" },
  Lab: { bg: "var(--success-soft)", color: "var(--success)" },
  Exam: { bg: "var(--danger-soft)", color: "var(--danger)" },
  Tutorial: { bg: "var(--amber-soft)", color: "var(--amber-600)" },
};

function LectureCard({ lecture, showFaculty = true, showStudents = false }) {
  const typeStyle = typeColors[lecture.type] || typeColors.Theory;

  const formatTime = (time) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const timeStr = `${formatTime(lecture.startTime)} — ${formatTime(lecture.endTime)}`;

  return (
    <div className="lecture-card">
      <div className="lecture-card-top">
        <span
          className="lecture-type-badge"
          style={{ background: typeStyle.bg, color: typeStyle.color }}
        >
          {lecture.type}
        </span>
        <span className="lecture-time">{timeStr}</span>
      </div>
      <h4 className="lecture-course-name">{lecture.course}</h4>
      <div className="lecture-details">
        <span className="lecture-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {lecture.faculty}
        </span>
        <span className="lecture-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
            <path d="M12 3v6" />
          </svg>
          {lecture.room}
        </span>
        {lecture.semester && (
          <span className="lecture-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M22 10 12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
            </svg>
            Sem {lecture.semester} · Section {lecture.section}
          </span>
        )}
        {showStudents && lecture.students && (
          <span className="lecture-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {lecture.students} Students
          </span>
        )}
      </div>
    </div>
  );
}

export default LectureCard;
