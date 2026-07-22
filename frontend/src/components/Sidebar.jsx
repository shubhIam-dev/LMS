// Sidebar — navigation for logged-in pages.
// Reads the current user from Redux and dispatches logout().
// Links dynamically adapt based on user role.

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

  const navItems = [
    { path: dashboardPath, label: "Dashboard" },
    { path: "/courses", label: "Courses" },
    { path: "/assignments", label: "Assignments" },
    { path: "/calendar", label: "Calendar" },
    { path: "/marks", label: "Marks" },
    { path: profilePath, label: "Profile" },
    { path: "/attendance", label: "Attendance" },
    // Teachers and superadmins get the create/manage console.
    ...(isStaff ? [{ path: "/manage", label: "Teacher Console" }] : []),
    // Superadmins get admin-only links
    ...(isAdmin ? [{ path: "/dashboard/admin", label: "Admin Dashboard" }] : []),
  ];

  return (
    <aside className="sidebar">
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
        <button onClick={() => dispatch(logout())} className="logout-btn">
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
