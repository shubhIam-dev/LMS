// RoleSwitcher — dropdown in the Faculty Dashboard hero that lets faculty
// switch between their own dashboard view and a student preview.

import { useState, useRef, useEffect } from "react";

function RoleSwitcher({ viewMode, onViewModeChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (mode) => {
    onViewModeChange(mode);
    setOpen(false);
  };

  return (
    <div className="role-switcher" ref={ref}>
      <button
        className={`faculty-dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="faculty-dropdown-label">
          {viewMode === "faculty" ? "Faculty" : "Student Preview"}
        </span>
        <svg
          className={`faculty-dropdown-arrow ${open ? "rotated" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="14"
          height="14"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="role-switcher-menu">
          <div className="role-switcher-header">
            <span className="role-switcher-title">Switch View</span>
          </div>
          <div className="role-switcher-options">
            <button
              className={`role-switcher-option ${viewMode === "faculty" ? "active" : ""}`}
              onClick={() => handleSelect("faculty")}
            >
              <span className="role-switcher-radio">
                {viewMode === "faculty" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <div className="role-switcher-option-text">
                <span className="role-switcher-option-title">Faculty Dashboard</span>
                <span className="role-switcher-option-desc">Courses, assignments, marks, attendance</span>
              </div>
            </button>
            <button
              className={`role-switcher-option ${viewMode === "student" ? "active" : ""}`}
              onClick={() => handleSelect("student")}
            >
              <span className="role-switcher-radio">
                {viewMode === "student" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <div className="role-switcher-option-text">
                <span className="role-switcher-option-title">Student Dashboard Preview</span>
                <span className="role-switcher-option-desc">View portal as a student would see it</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSwitcher;
