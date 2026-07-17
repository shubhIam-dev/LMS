// FacultyDashboard — teaching overview fetched from the backend API.
// Shows courses taught, students, assignments, and quick management links.
// Features a role/action dropdown to view assigned students.

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { selectUser, selectRole } from "../store/authSlice";
import { dashboardApi } from "../services/api";

function FacultyDashboard() {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Student dropdown state ──
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchStudents();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");
      const result = await dashboardApi.getFacultyDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudents() {
    try {
      setStudentsLoading(true);
      const result = await dashboardApi.getFacultyStudents();
      setStudents(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to load students:", err.message);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }

  function handleStudentClick(studentId) {
    setDropdownOpen(false);
    navigate(`/dashboard/student/${studentId}`);
  }

  // Filter students by search
  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.rollNumber || "").toLowerCase().includes(q) ||
      (s.department || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  });

  // ── Loading state ──
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-screen">
          <div className="loading-spinner">Loading your dashboard...</div>
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
          <button className="login-btn" onClick={fetchDashboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const courses = data?.courses || [];

  return (
    <div className="dashboard-page">
      {/* ── Hero / Welcome ── */}
      <div className="dash-hero">
        <div className="dash-hero-content">
          <div className="dash-hero-text">
            <h1 className="dash-hero-greeting">
              Welcome, {user?.name || "Faculty"}
            </h1>
            <p className="dash-hero-subtitle">
              Manage your courses, assignments, and student performance.
            </p>
          </div>
          <div className="dash-hero-badge">
            {/* ── Role Dropdown ── */}
            <div className="faculty-dropdown" ref={dropdownRef}>
              <button
                className={`faculty-dropdown-trigger ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="faculty-dropdown-label">
                  {role === "superadmin" ? "Super Admin" : "Faculty"}
                </span>
                <svg
                  className={`faculty-dropdown-arrow ${dropdownOpen ? "rotated" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="faculty-dropdown-menu">
                  <div className="faculty-dropdown-header">
                    <span className="faculty-dropdown-title">Your Students</span>
                    <span className="faculty-dropdown-count">
                      {students.length}
                    </span>
                  </div>

                  {/* Search */}
                  <div className="faculty-search-wrapper">
                    <svg
                      className="faculty-search-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      type="text"
                      className="faculty-search-input"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Student List */}
                  <div className="faculty-student-list">
                    {studentsLoading ? (
                      <div className="faculty-student-empty">
                        Loading students...
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <button
                          key={s._id}
                          className="faculty-student-item"
                          onClick={() => handleStudentClick(s._id)}
                        >
                          <div className="faculty-student-avatar">
                            {s.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="faculty-student-info">
                            <span className="faculty-student-name">
                              {s.name || "Unknown"}
                            </span>
                            <span className="faculty-student-meta">
                              {s.rollNumber || s.department
                                ? [s.rollNumber, s.department]
                                    .filter(Boolean)
                                    .join(" · ")
                                : s.email || ""}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="faculty-student-empty">
                        {searchQuery
                          ? "No students match your search."
                          : "No students assigned yet."}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
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
              <span className="dash-stat-value">{courses.length}</span>
              <span className="dash-stat-label">Courses</span>
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
              <span className="dash-stat-value">{data?.stats?.assignments ?? "—"}</span>
              <span className="dash-stat-label">Assignments</span>
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
              <span className="dash-stat-value">{data?.stats?.students ?? "—"}</span>
              <span className="dash-stat-label">Students</span>
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
              <span className="dash-stat-value">{user?.name?.split(" ")[0] || "Faculty"}</span>
              <span className="dash-stat-label">Welcome</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Courses ── */}
      <div className="dash-detailed-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">My Courses</h2>
          <span className="dash-card-count">{courses.length}</span>
        </div>
        <div className="dash-teacher-courses">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course._id || course.code} className="dash-teacher-row">
                <div className="dash-teacher-info">
                  <span className="dash-teacher-name">
                    {course.name || course.CourseName || "Untitled"}
                  </span>
                  <span className="dash-teacher-code">
                    {course.code || course.CourseCode || ""}
                  </span>
                </div>
                <span className="dash-teacher-meta">
                  {course.studentCount ?? course.enrolledStudents?.length ?? 0} students
                </span>
              </div>
            ))
          ) : (
            <div className="dash-empty">No courses assigned yet.</div>
          )}
        </div>
      </div>

      {/* ── Quick Management Links ── */}
      <div className="dash-links-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Quick Actions</h2>
        </div>
        <div className="dash-links-grid">
          <Link to="/courses" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">Manage Courses</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
          <Link to="/assignments" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--assignments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">Manage Assignments</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
          <Link to="/marks" className="dash-link-card">
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
          <Link to="/manage" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--assignments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">Teacher Console</span>
              <span className="dash-link-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
          <Link to="/faculty/profile" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">My Profile</span>
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

export default FacultyDashboard;
