// AdminDashboard — system-wide overview for superadmin.
// Shows user counts, all courses, assignments stats, and recent activity.

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectUser } from "../store/authSlice";
import { dashboardApi } from "../services/api";

function AdminDashboard() {
  const user = useSelector(selectUser);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");
      const result = await dashboardApi.getAdminDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-screen">
          <div className="loading-spinner">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="dashboard-page">
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>{error}</p>
          <button className="login-btn" onClick={fetchDashboard}>Try Again</button>
        </div>
      </div>
    );
  }

  const s = data?.stats || {};

  return (
    <div className="dashboard-page">
      {/* ── Hero ── */}
      <div className="dash-hero">
        <div className="dash-hero-content">
          <div className="dash-hero-text">
            <h1 className="dash-hero-greeting">
              Admin Dashboard
            </h1>
            <p className="dash-hero-subtitle">
              System-wide overview. Welcome, {user?.name || "Admin"}.
            </p>
          </div>
          <div className="dash-hero-badge">
            <span className="dash-role-badge">Super Admin</span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="dash-stats-section">
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{s.totalStudents ?? "—"}</span>
              <span className="dash-stat-label">Students</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--assignments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{s.totalTeachers ?? "—"}</span>
              <span className="dash-stat-label">Teachers</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon dash-stat-icon--courses">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{s.totalCourses ?? "—"}</span>
              <span className="dash-stat-label">Total Courses</span>
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
              <span className="dash-stat-value">{s.totalAssignments ?? "—"}</span>
              <span className="dash-stat-label">Assignments</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── User Distribution + Submission Status ── */}
      <div className="dash-cards-section">
        <div className="dash-overview-card">
          <div className="dash-card-header">
            <span className="dash-card-title">User Distribution</span>
            <span className="dash-card-count">{s.totalUsers ?? 0}</span>
          </div>
          <div className="dash-card-body">
            <ul className="dash-item-list">
              <li className="dash-item-row">
                <div className="dash-item-info">
                  <span className="dash-item-name">Students</span>
                </div>
                <span className="dash-item-badge dash-badge--active">{s.totalStudents ?? 0}</span>
              </li>
              <li className="dash-item-row">
                <div className="dash-item-info">
                  <span className="dash-item-name">Teachers</span>
                </div>
                <span className="dash-item-badge" style={{ background: "#6366f1", color: "#fff" }}>{s.totalTeachers ?? 0}</span>
              </li>
              <li className="dash-item-row">
                <div className="dash-item-info">
                  <span className="dash-item-name">Admins</span>
                </div>
                <span className="dash-item-badge" style={{ background: "#f59e0b", color: "#fff" }}>{s.totalAdmins ?? 0}</span>
              </li>
            </ul>
          </div>
          <Link to="/manage" className="dash-widget-footer" style={{ textDecoration: "none" }}>
            Manage Users →
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="dash-overview-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Submission Status</span>
          </div>
          <div className="dash-card-body">
            <ul className="dash-item-list">
              <li className="dash-item-row">
                <div className="dash-item-info">
                  <span className="dash-item-name">Total Submissions</span>
                </div>
                <span className="dash-item-badge dash-badge--active">{s.totalSubmissions ?? 0}</span>
              </li>
              <li className="dash-item-row">
                <div className="dash-item-info">
                  <span className="dash-item-name">Pending Grading</span>
                </div>
                <span className="dash-item-badge" style={{ background: "#f59e0b", color: "#fff" }}>{s.pendingGrading ?? 0}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Recent Registrations ── */}
      <div className="dash-detailed-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Recent Registrations</h2>
          <span className="dash-card-count">{data?.recentUsers?.length || 0}</span>
        </div>
        <div className="dash-teacher-courses">
          {data?.recentUsers?.length > 0 ? (
            data.recentUsers.map((u) => (
              <div key={u._id} className="dash-teacher-row">
                <div className="dash-teacher-info">
                  <span className="dash-teacher-name">{u.name}</span>
                  <span className="dash-teacher-code">{u.email} · {u.role}</span>
                </div>
                <span className="dash-teacher-meta">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="dash-empty">No recent registrations.</div>
          )}
        </div>
      </div>

      {/* ── All Courses ── */}
      <div className="dash-detailed-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">All Courses</h2>
          <span className="dash-card-count">{data?.courses?.length || 0}</span>
        </div>
        <div className="dash-teacher-courses">
          {data?.courses?.length > 0 ? (
            data.courses.map((c) => (
              <div key={c._id} className="dash-teacher-row">
                <div className="dash-teacher-info">
                  <span className="dash-teacher-name">{c.CourseName}</span>
                  <span className="dash-teacher-code">
                    {c.CourseCode} · {c.instructor?.name || "No instructor"}
                  </span>
                </div>
                <span className="dash-teacher-meta">
                  {c.enrolledStudents?.length || 0} students
                </span>
              </div>
            ))
          ) : (
            <div className="dash-empty">No courses yet.</div>
          )}
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="dash-links-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Quick Actions</h2>
        </div>
        <div className="dash-links-grid">
          <Link to="/manage" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--courses">
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
          <Link to="/courses" className="dash-link-card">
            <div className="dash-link-icon dash-link-icon--assignments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="dash-link-body">
              <span className="dash-link-text">View All Courses</span>
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

export default AdminDashboard;
