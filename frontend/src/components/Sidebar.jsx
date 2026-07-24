// Sidebar — navigation for logged-in pages.
// Reads the current user from Redux and dispatches logout().
// Links dynamically adapt based on user role.

import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectRole, logout } from "../store/authSlice";

const ROLE_LABEL = {
  student: "Student",
  teacher: "Teacher",
  superadmin: "Super Admin",
};

function Sidebar() {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const dispatch = useDispatch();

  const isAdmin = role === "superadmin";
  const isStaff = role === "teacher" || isAdmin;
  const dashboardPath = isAdmin ? "/dashboard/admin" : isStaff ? "/dashboard/faculty" : "/dashboard/student";
  const profilePath = isStaff ? "/profile/faculty" : "/profile/student";

  // ── Mobile sidebar toggle ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => setSidebarOpen(false);
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // Close sidebar when clicking a nav link on mobile
  const handleNavClick = useCallback(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  // ── Theme toggle ──
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const navItems = [
    { path: dashboardPath, label: "Dashboard" },
    { path: "/courses", label: "Courses" },
    { path: "/assignments", label: "Assignments" },
    { path: "/calendar", label: "Calendar" },
    ...(isStaff
      ? [{ path: "/faculty/scores", label: "Score Management" }]
      : [{ path: "/score", label: "Scorecard" }]
    ),
    { path: profilePath, label: "Profile" },
    { path: "/attendance", label: "Attendance" },
    // Teachers and superadmins get the create/manage console.
    ...(isStaff ? [{ path: "/manage", label: "Teacher Console" }] : []),
    // Superadmins get admin-only links
    ...(isAdmin ? [{ path: "/dashboard/admin", label: "Admin Dashboard" }] : []),
  ];

  return (
    <>
      {/* Hamburger toggle button — visible only on mobile */}
      <button
        className={`mobile-menu-toggle ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Backdrop overlay — visible only on mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo"></div>
          <h2>ERP Portal</h2>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name || "User"}</p>
            <p className="user-role">{ROLE_LABEL[role] || "Student"}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {item.label === "Calendar" && (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
                </svg>
              )}
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="theme-toggle-btn"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: "var(--radius)",
              background: "transparent", border: "1px solid var(--on-dark-fade)",
              color: "var(--on-dark-mute)", width: "100%",
              fontSize: 13, fontWeight: 500, marginBottom: 8,
              cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
                 style={{ flexShrink: 0 }}>
              {theme === "dark" ? (
                // Sun icon for dark mode → switch to light
                <>
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </>
              ) : (
                // Moon icon for light mode → switch to dark
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              )}
            </svg>
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button onClick={() => dispatch(logout())} className="logout-btn">
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
