// Sidebar — navigation for logged-in pages.
// Reads the current user from Redux and dispatches logout().
<<<<<<< HEAD
// 🆕 Now shows "My Profile" link — takes you to student or faculty profile
//    based on your role!
// 🎭 Teachers can switch between "Student View" and "Teacher View" via dropdown!

import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectViewMode, logout, setViewMode } from "../store/authSlice";

function Sidebar() {
  const user = useSelector(selectUser);
  const viewMode = useSelector(selectViewMode);
  const dispatch = useDispatch();

  // Determine which profile page to link to based on current view mode
  const profilePath = viewMode === "teacher" ? "/faculty-profile" : "/profile";

  // Navigation items — same for both views, only the profile link adapts
=======

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

  const isStaff = role === "teacher" || role === "superadmin";
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/courses", label: "Courses" },
    { path: "/assignments", label: "Assignments" },
    { path: "/marks", label: "Marks" },
<<<<<<< HEAD
    { path: profilePath, label: "My Profile" },
  ];

  // 🎭 Handle view mode switch
  function handleViewSwitch(e) {
    dispatch(setViewMode(e.target.value));
  }

  // Is this user a teacher (can they switch views)?
  const isTeacher = user?.role === "teacher";
=======
    // Teachers and superadmins get the create/manage console.
    ...(isStaff ? [{ path: "/manage", label: "Teacher Console" }] : []),
  ];
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232

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
<<<<<<< HEAD
          <p className="user-name">{user?.name || "Student"}</p>
          <p className="user-role">
            {viewMode === "teacher" ? "Faculty" : "Student"}
          </p>
        </div>
      </div>

      {/* 🎭 Role Switcher — only visible for teachers */}
      {isTeacher && (
        <div className="role-switcher">
          <label className="role-switcher-label">View as:</label>
          <select
            className="role-switcher-select"
            value={viewMode}
            onChange={handleViewSwitch}
          >
            <option value="teacher">👨‍🏫 Teacher</option>
            <option value="student">🎓 Student</option>
          </select>
        </div>
      )}

=======
          <p className="user-name">{user?.name || "User"}</p>
          <p className="user-role">{ROLE_LABEL[role] || "Student"}</p>
        </div>
      </div>

>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
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
