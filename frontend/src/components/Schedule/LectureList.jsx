import LectureCard from "./LectureCard";

function LectureList({ date, lectures, showFaculty = true, showStudents = false, emptyMessage = "No lectures scheduled." }) {
  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date("2026-07-20T00:00:00");
    const tomorrow = new Date("2026-07-21T00:00:00");

    if (d.getTime() === today.getTime()) return "Today";
    if (d.getTime() === tomorrow.getTime()) return "Tomorrow";

    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="lecture-list">
      <div className="lecture-list-header">
        <span className="lecture-list-day">{formatDateHeader(date)}</span>
        <span className="lecture-list-count">
          {lectures.length} lecture{lectures.length !== 1 ? "s" : ""}
        </span>
      </div>
      {lectures.length > 0 ? (
        <div className="lecture-list-cards">
          {lectures.map((lecture) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              showFaculty={showFaculty}
              showStudents={showStudents}
            />
          ))}
        </div>
      ) : (
        <div className="lecture-list-empty">{emptyMessage}</div>
      )}
    </div>
  );
}

export default LectureList;
