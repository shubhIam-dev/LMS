// Sidebar — navigation for logged-in pages.
// Reads the current user from Redux and dispatches logout().

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

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/courses", label: "Courses" },
    { path: "/assignments", label: "Assignments" },
    { path: "/marks", label: "Marks" },
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
