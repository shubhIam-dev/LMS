// Dashboard - The home page after login
// This is like the main notice board of the college - shows everything at a glance!
// 🎭 Has TWO modes:
//    • Student View — shows enrolled courses, assignments, marks
//    • Teacher View — shows courses you teach, students, pending grading

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { courseApi, assignmentApi, marksApi } from "../services/api";
import { Link } from "react-router-dom";
import { selectUser, selectRole } from "../store/authSlice";

// ─── SVG ring progress component (extracted to avoid re-creation) ───
function ProgressRing({ value, maxValue, color, label, size = 100 }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="insight-ring">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="insight-ring-value">{value}</div>
      <div className="insight-ring-label">{label}</div>
    </div>
  );
}

function Dashboard() {
  // Get the currently logged-in user's info from Redux
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  // Derive view mode from the user's role
  const viewMode = role === "teacher" || role === "faculty" ? "teacher" : "student";

  // State to store data we fetch from the backend
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // When this page loads, fetch all the data from the backend
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch courses and assignments
        const [coursesData, assignmentsData] = await Promise.all([
          courseApi.getAllCourses(),
          assignmentApi.getAllAssignments(),
        ]);

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

        // Also fetch marks if we're in student view or have a user ID
        if (user?._id) {
          try {
            const marksData = await marksApi.getMarksByStudent(user._id);
            setMarks(Array.isArray(marksData) ? marksData : []);
          } catch {
            // Marks might not exist yet — that's okay
            setMarks([]);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, viewMode]);

  // Filter courses based on view mode
  // Teacher view: courses they teach
  // Student view: all courses
  const displayedCourses = viewMode === "teacher" && user?._id
    ? courses.filter(c => c.instructor === user._id || c.instructor?._id === user._id)
    : courses;

  // Show a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* ============================================================ */}
      {/* 🏆 SECTION 1: WELCOME BANNER                                 */}
      {/* ============================================================ */}
      <section className="dash-hero">
        <div className="dash-hero-content">
          <div className="dash-hero-text">
            <h1 className="dash-hero-greeting">Welcome, {user?.name || "User"}!</h1>
            <p className="dash-hero-subtitle">
              {viewMode === "teacher"
                ? "Faculty Dashboard — manage your courses, assignments, and students at a glance."
                : "Student Dashboard — here's your academic overview at a glance."
              }
            </p>
          </div>
          <div className="dash-hero-badge">
            <span className="dash-role-badge">
              {viewMode === "teacher" ? "Faculty" : "Student"}
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 📊 SECTION 2: STATISTICS GRID                                */}
      {/* ============================================================ */}
      <section className="dash-stats-section">
        <div className="dash-stats-grid">
          <article className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{displayedCourses.length}</span>
              <span className="dash-stat-label">{viewMode === "teacher" ? "My Courses" : "Total Courses"}</span>
            </div>
          </article>

          <article className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--assignments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M9 12h6" /><path d="M9 16h6" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{assignments.length}</span>
              <span className="dash-stat-label">Assignments</span>
            </div>
          </article>


        </div>
      </section>

      {/* ============================================================ */}
      {/* 📋 SECTION 3: ACADEMIC OVERVIEW + RECENT ASSIGNMENTS         */}
      {/* ============================================================ */}
      <section className="dash-cards-section">
        {/* LEFT CARD: Academic Overview — courses */}
        <article className="dash-overview-card">
          <header className="dash-card-header">
            <h2 className="dash-card-title">Academic Overview</h2>
            <span className="dash-card-count">{displayedCourses.length} course{displayedCourses.length !== 1 ? "s" : ""}</span>
          </header>
          <div className="dash-card-body">
            {displayedCourses.length > 0 ? (
              <ul className="dash-item-list">
                {displayedCourses.slice(0, 5).map((course) => (
                  <li key={course._id} className="dash-item-row">
                    <div className="dash-item-info">
                      <span className="dash-item-name">{course.CourseName}</span>
                      {course.CourseCode && (
                        <span className="dash-item-code">{course.CourseCode}</span>
                      )}
                    </div>
                    <span className="dash-item-badge dash-badge--active">Active</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dash-empty">
                <p>No courses enrolled yet.</p>
              </div>
            )}
          </div>
        </article>

        {/* RIGHT CARD: Recent Assignments */}
        <article className="dash-overview-card">
          <header className="dash-card-header">
            <h2 className="dash-card-title">Recent Assignments</h2>
            <span className="dash-card-count">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</span>
          </header>
          <div className="dash-card-body">
            {assignments.length > 0 ? (
              <ul className="dash-item-list">
                {assignments.slice(0, 5).map((assignment) => {
                  const dueDate = assignment.dueOn || assignment.dueDate;
                  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;
                  return (
                    <li key={assignment._id} className="dash-item-row">
                      <div className="dash-item-info">
                        <span className="dash-item-name">{assignment.title || assignment.assignmentName}</span>
                        {dueDate && (
                          <span className="dash-item-date">
                            {isOverdue ? "Overdue" : `Due ${new Date(dueDate).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                      <span className={`dash-item-badge ${isOverdue ? "dash-badge--overdue" : "dash-badge--pending"}`}>
                        {isOverdue ? "Overdue" : "Pending"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="dash-empty">
                <p>No assignments yet.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* ============================================================ */}
      {/* 📈 SECTION 4: DASHBOARD INSIGHTS                             */}
      {/* ============================================================ */}
      <section className="dash-insights-section">
        <header className="dash-section-header">
          <h2 className="dash-section-title">Dashboard Insights</h2>
          <p className="dash-section-desc">Visual comparison of courses and assignments</p>
        </header>
        <div className="dash-insights-grid">
          <ProgressRing
            value={displayedCourses.length}
            maxValue={Math.max(displayedCourses.length, assignments.length, 1)}
            color="var(--primary-500)"
            label="Courses"
          />
          <ProgressRing
            value={assignments.length}
            maxValue={Math.max(displayedCourses.length, assignments.length, 1)}
            color="var(--amber-500)"
            label="Assignments"
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 🔗 SECTION 5: QUICK LINKS                                    */}
      {/* ============================================================ */}
      <section className="dash-links-section">
        <header className="dash-section-header">
          <h2 className="dash-section-title">{viewMode === "teacher" ? "Quick Actions" : "Quick Links"}</h2>
        </header>
        <div className="dash-links-grid">
          <Link to="/courses" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">{viewMode === "teacher" ? "My Courses" : "View Courses"}</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          <Link to="/assignments" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--assignments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M9 12h6" /><path d="M9 16h6" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">{viewMode === "teacher" ? "Assignments" : "View Assignments"}</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          <Link to="/marks" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--marks">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">{viewMode === "teacher" ? "Student Marks" : "Check Marks"}</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 📋 SECTION 6: DETAILED SECTIONS (kept from original)         */}
      {/* ============================================================ */}

      {/* 👨‍🏫 Teacher: Show courses they teach */}
      {viewMode === "teacher" && displayedCourses.length > 0 && (
        <section className="dash-detailed-section">
          <header className="dash-section-header">
            <h2 className="dash-section-title">Your Teaching Courses</h2>
            <span className="dash-card-count">{displayedCourses.length} course{displayedCourses.length !== 1 ? "s" : ""}</span>
          </header>
          <div className="dash-teacher-courses">
            {displayedCourses.map((course) => (
              <div key={course._id} className="dash-teacher-row">
                <div className="dash-teacher-info">
                  <h3 className="dash-teacher-name">{course.CourseName}</h3>
                  <span className="dash-teacher-code">{course.CourseCode}</span>
                </div>
                <span className="dash-teacher-meta">
                  {course.enrolledStudents?.length || 0} student{course.enrolledStudents?.length !== 1 ? "s" : ""} enrolled
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🎓 Student: Show their marks summary */}
      {viewMode === "student" && marks.length > 0 && (
        <section className="dash-detailed-section">
          <header className="dash-section-header">
            <h2 className="dash-section-title">Recent Marks</h2>
            <span className="dash-card-count">{marks.length} mark{marks.length !== 1 ? "s" : ""}</span>
          </header>
          <div className="dash-marks-list">
            {marks.slice(0, 5).map((mark) => (
              <div key={mark._id} className="dash-marks-row">
                <span className="dash-marks-course">{mark.courseName}</span>
                <span className="dash-marks-score">
                  {mark.marksObtained}/{mark.totalMarks}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
