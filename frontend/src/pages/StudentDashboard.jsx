// StudentDashboard — aggregated academic overview fetched from the backend API.
// Shows enrolled courses, pending assignments, marks/scores, quick links,
// and a compact calendar widget that links to the full Calendar page.

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { selectUser, selectRole } from "../store/authSlice";
import { dashboardApi } from "../services/api";
import MiniCalendar from "../components/Calendar/MiniCalendar";
import EventCard from "../components/Schedule/EventCard";
import calendarEvents, { getEventsByDate } from "../data/calendarEvents";

function StudentDashboard({ previewMode = false }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const isReadOnly = Boolean(studentId) && (role === "teacher" || role === "superadmin") || previewMode;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, [studentId]);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");
      const result = await dashboardApi.getStudentDashboard(studentId);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  // ── Schedule widget state ──
  const [widgetDate, setWidgetDate] = useState("2026-07-20");
  const todayEvents = useMemo(() => getEventsByDate("2026-07-20"), []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-screen">
          <div className="loading-spinner">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error && !data) {
    return (
      <div className="dashboard-page">
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>{error}</p>
          {isReadOnly && (
            <button
              className="login-btn"
              onClick={() => navigate("/dashboard/faculty")}
              style={{ marginRight: 12 }}
            >
              ← Back to Faculty Dashboard
            </button>
          )}
          <button className="login-btn" onClick={fetchDashboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const courses = data?.courses || [];
  const assignments = data?.assignments || [];
  const summary = data?.summary || {};

  const displayName = isReadOnly
    ? (data?.studentName || "Student")
    : user?.name || "Student";

  return (
    <div className="dashboard-page">
      {/* ── Read-Only Banner ── */}
      {isReadOnly && (
        <div className="readonly-banner">
          <div className="readonly-banner-content">
            <div className="readonly-banner-info">
              <span className="readonly-badge">Read Only</span>
              <span className="readonly-text">
                Viewing Student: <strong>{displayName}</strong>
              </span>
            </div>
            <button
              className="readonly-back-btn"
              onClick={() => navigate("/dashboard/faculty")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Back to Faculty Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── Hero / Welcome Banner ── */}
      <div className="dash-hero">
        <div className="dash-hero-content">
          <div className="dash-hero-text">
            <h1 className="dash-hero-greeting">
              {isReadOnly ? `${displayName}'s Dashboard` : `Welcome back, ${user?.name || "Student"}`}
            </h1>
            <p className="dash-hero-subtitle">
              {isReadOnly
                ? "Viewing student academic overview. No editing allowed."
                : "Here&apos;s your academic overview for this semester."}
            </p>
          </div>
          <div className="dash-hero-badge">
            <span className="dash-role-badge">
              {isReadOnly ? "Viewing Student" : "Student"}
            </span>
            {summary?.upcomingDeadlines?.length > 0 && (
              <span className="dash-term-badge">
                {summary.upcomingDeadlines.length} upcoming
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="dash-stats-section">
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{summary?.totalCourses ?? courses.length}</span>
              <span className="dash-stat-label">Enrolled Courses</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--assignments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{summary?.pendingCount ?? assignments.length}</span>
              <span className="dash-stat-label">Pending Assignments</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">
                {data?.marksBreakdown?.overall?.percentage != null
                  ? `${data.marksBreakdown.overall.percentage}%`
                  : "—"}
              </span>
              <span className="dash-stat-label">Overall Score</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{summary?.gradedCount ?? 0}</span>
              <span className="dash-stat-label">Graded</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Courses + Assignments Cards ── */}
      <div className="dash-cards-section">
        <div className="dash-overview-card">
          <div className="dash-card-header">
            <span className="dash-card-title">My Courses</span>
            <span className="dash-card-count">{courses.length}</span>
          </div>
          <div className="dash-card-body">
            {courses.length > 0 ? (
              <ul className="dash-item-list">
                {courses.slice(0, 5).map((course) => (
                  <li key={course._id || course.code || course.CourseCode} className="dash-item-row">
                    <div className="dash-item-info">
                      <span className="dash-item-name">
                        {course.name || course.CourseName || "Untitled"}
                      </span>
                      <span className="dash-item-code">
                        {course.code || course.CourseCode || ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dash-empty">No enrolled courses yet.</div>
            )}
          </div>
        </div>

        <div className="dash-overview-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Pending Assignments</span>
            <span className="dash-card-count">{summary?.pendingCount ?? 0}</span>
          </div>
          <div className="dash-card-body">
            {summary?.upcomingDeadlines?.length > 0 ? (
              <ul className="dash-item-list">
                {summary.upcomingDeadlines.slice(0, 5).map((a) => (
                  <li key={a._id} className="dash-item-row">
                    <div className="dash-item-info">
                      <span className="dash-item-name">{a.title || "Untitled"}</span>
                      {a.dueOn && (
                        <span className="dash-item-date">
                          Due: {new Date(a.dueOn).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <span className="dash-item-badge dash-badge--active">
                      {a.status || "Open"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dash-empty">
                {summary?.totalAssignments > 0
                  ? "All assignments submitted!"
                  : "No assignments yet."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Calendar Widget + Today's Schedule ── */}
      <div className="dash-calendar-row">
        <div className="dash-widget-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Calendar</span>
            <Link to="/calendar" className="dash-widget-link">View Full →</Link>
          </div>
          <MiniCalendar
            events={calendarEvents}
            selectedDate={widgetDate}
            onDateSelect={(date) => {
              setWidgetDate(date);
              navigate(`/calendar?date=${date}`);
            }}
          />
        </div>

        <div className="dash-widget-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Today's Schedule</span>
            <span className="dash-card-count">{todayEvents.length}</span>
          </div>
          <div className="dash-widget-body">
            {todayEvents.length > 0 ? (
              todayEvents.slice(0, 4).map((e) => (
                <EventCard key={e.id} event={e} compact />
              ))
            ) : (
              <div className="dash-empty">No lectures today</div>
            )}
            {todayEvents.length > 4 && (
              <Link to="/calendar" className="dash-widget-more">+{todayEvents.length - 4} more</Link>
            )}
          </div>
          <Link to="/calendar" className="dash-widget-footer">
            View Full Calendar
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Marks Breakdown ── */}
      {data?.marksBreakdown && (
        <div className="dash-insights-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Performance</h2>
            <span className="dash-section-desc">
              {data.marksBreakdown.overall.count || 0} assessments
            </span>
          </div>
          <div className="dash-insights-grid">
            <div className="insight-ring">
              <span className="insight-ring-value">
                {data.marksBreakdown.internal?.percentage ?? "—"}%
              </span>
              <span className="insight-ring-label">Internal</span>
            </div>
            <div className="insight-ring">
              <span className="insight-ring-value">
                {data.marksBreakdown.external?.percentage ?? "—"}%
              </span>
              <span className="insight-ring-label">External</span>
            </div>
            <div className="insight-ring">
              <span className="insight-ring-value">
                {data.marksBreakdown.assignments?.percentage ?? "—"}%
              </span>
              <span className="insight-ring-label">Assignments</span>
            </div>
            <div className="insight-ring">
              <span className="insight-ring-value">
                {data.marksBreakdown.overall?.percentage ?? "—"}%
              </span>
              <span className="insight-ring-label">Overall</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Marks ── */}
      {data?.marksBreakdown?.recentResults?.length > 0 && (
        <div className="dash-detailed-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Recent Results</h2>
          </div>
          <div className="dash-marks-list">
            {data.marksBreakdown.recentResults.map((m, i) => (
              <div key={i} className="dash-marks-row">
                <span className="dash-marks-course">
                  {m.examType || m.courseName || "Assessment"}
                </span>
                <span className="dash-marks-score">
                  {m.marksObtained ?? "?"}/{m.totalMarks ?? "?"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="dash-links-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Quick Links</h2>
        </div>
        <div className="dash-links-grid">
          <Link to={isReadOnly ? "#" : "/courses"} className="dash-link-card" onClick={isReadOnly ? (e) => e.preventDefault() : undefined}>
            <div className="dash-link-icon dash-link-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">View Courses</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
          <Link to={isReadOnly ? "#" : "/assignments"} className="dash-link-card" onClick={isReadOnly ? (e) => e.preventDefault() : undefined}>
            <div className="dash-link-icon dash-link-icon--assignments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">View Assignments</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
          <Link to={isReadOnly ? "#" : "/marks"} className="dash-link-card" onClick={isReadOnly ? (e) => e.preventDefault() : undefined}>
            <div className="dash-link-icon dash-link-icon--marks">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">View Marks</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
          <Link to={isReadOnly ? "#" : "/student/profile"} className="dash-link-card" onClick={isReadOnly ? (e) => e.preventDefault() : undefined}>
            <div className="dash-link-icon dash-link-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">Profile</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
