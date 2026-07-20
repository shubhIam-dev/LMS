import LectureCard from "./LectureCard";

function UpcomingLectures({ lectures, showFaculty = true }) {
  const sorted = [...lectures]
    .sort((a, b) => {
      const dateA = new Date(a.date + "T" + a.startTime);
      const dateB = new Date(b.date + "T" + b.startTime);
      return dateA - dateB;
    })
    .slice(0, 5);

  return (
    <div className="upcoming-lectures">
      <div className="dash-card-header">
        <span className="dash-card-title">Upcoming Lectures</span>
        <span className="dash-card-count">{sorted.length}</span>
      </div>
      <div className="upcoming-lectures-body">
        {sorted.length > 0 ? (
          sorted.map((lecture) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              showFaculty={showFaculty}
            />
          ))
        ) : (
          <div className="lecture-list-empty">No upcoming lectures.</div>
        )}
      </div>
    </div>
  );
}

export default UpcomingLectures;
