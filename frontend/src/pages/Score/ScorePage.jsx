// ScorePage — Main Scorecard Page
// Shows all enrolled subjects as interactive cards.
// Each card displays the course name, code, overall percentage, and attendance.
// Click a card to view the detailed score breakdown.

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../../store/authSlice";
import { scoreApi } from "./scoreApi";
import "./Score.css";

function ScorePage() {
  // Get the currently logged-in user from Redux
  const user = useSelector(selectUser);

  // State management
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Navigation hook for clicking on subject cards
  const navigate = useNavigate();

  // ── Fetch scores when the page loads ───────────────────────────
  useEffect(() => {
    async function fetchScores() {
      try {
        if (!user?._id) {
          setError("User not found. Please log in again.");
          setLoading(false);
          return;
        }

        const data = await scoreApi.getByStudent(user._id);
        setScores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load scores:", err);
        setError("Could not load your scores. Make sure you are enrolled in courses.");
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [user]);

  // ── Helpers ────────────────────────────────────────────────────

  // Returns a CSS class based on the percentage value
  function getPercentageClass(pct) {
    if (pct >= 75) return "score-pct-excellent";
    if (pct >= 60) return "score-pct-good";
    return "score-pct-poor";
  }

  // Returns a formatted percentage string
  function formatPercentage(value) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return `${value}%`;
  }

  // ── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-content">
        <div className="score-loading">Loading your scorecard...</div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <h1>
          <em>Score</em>card
        </h1>
        <p>
          Your academic performance across all enrolled subjects this semester.
        </p>
      </div>

      {/* Error message */}
      {error && <div className="score-error">{error}</div>}

      {/* No scores yet */}
      {scores.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>No Scores Yet</h3>
          <p>
            Your scores will appear here once your teachers publish them. Check
            back after your assessments are graded.
          </p>
        </div>
      ) : (
        /* Subject Cards Grid */
        <div className="score-subjects-grid">
          {scores.map((score) => {
            const pct = score.overallPercentage || 0;
            const attPct = score.attendancePercentage || 0;

            return (
              <div
                key={score._id}
                className="score-subject-card"
                onClick={() =>
                  navigate(`/score/${score.courseId?._id || score.courseId}`)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/score/${score.courseId?._id || score.courseId}`);
                  }
                }}
              >
                {/* Card Header */}
                <div className="score-subject-card-header">
                  <span className="score-subject-card-code">
                    {score.courseCode || "—"}
                  </span>
                </div>

                {/* Course Name */}
                <div className="score-subject-card-name">
                  {score.courseName}
                </div>

                {/* Meta Info */}
                <div className="score-subject-card-meta">
                  <span>Credits: {score.credits || "—"}</span>
                  <span>Semester: {score.semester || "—"}</span>
                </div>

                {/* Stats */}
                <div className="score-subject-card-stats">
                  {/* Overall Percentage */}
                  <div className="score-stat-badge">
                    <span
                      className={`score-stat-badge-value ${getPercentageClass(pct)}`}
                    >
                      {formatPercentage(pct)}
                    </span>
                    <span className="score-stat-badge-label">Score</span>
                  </div>

                  {/* GPA */}
                  <div className="score-stat-badge">
                    <span className="score-stat-badge-value">
                      {score.gpa && score.gpa > 0 ? score.gpa.toFixed(2) : "—"}
                    </span>
                    <span className="score-stat-badge-label">GPA</span>
                  </div>

                  {/* Attendance */}
                  <div className="score-stat-badge">
                    <span
                      className={`score-stat-badge-value ${getPercentageClass(attPct)}`}
                    >
                      {formatPercentage(attPct)}
                    </span>
                    <span className="score-stat-badge-label">Attendance</span>
                  </div>

                  {/* Grade */}
                  <div className="score-stat-badge">
                    <span
                      className={`score-stat-badge-value ${getPercentageClass(pct)}`}
                    >
                      {score.grade || "—"}
                    </span>
                    <span className="score-stat-badge-label">Grade</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScorePage;
