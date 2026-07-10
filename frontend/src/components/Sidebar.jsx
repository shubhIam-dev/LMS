// 🧭 Sidebar - The navigation menu on the left side
// This is like the college map - helps you navigate between different sections!

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();

  // 🗺️ Navigation items - each one is a page the student can visit
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/courses", label: "Courses", icon: "📚" },
    { path: "/assignments", label: "Assignments", icon: "📝" },
    { path: "/marks", label: "Marks", icon: "🏆" },
  ];

  return (
    <aside className="sidebar">
      {/* 🏫 College branding */}
      <div className="sidebar-header">
        <div className="sidebar-logo">🎓</div>
        <h2>ERP Portal</h2>
      </div>

      {/* 👤 User info */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.[0]?.toUpperCase() || "👤"}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.name || "Student"}</p>
          <p className="user-role">Student</p>
        </div>
      </div>

      {/* 🧭 Navigation links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 🚪 Logout button at the bottom */}
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
