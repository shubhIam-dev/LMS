// Courses - Shows all available courses
// This is like the college course catalog - lists every course offered!

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseApi } from "../services/api";
import { useSelector } from "react-redux";
import { selectUser, selectRole } from "../store/authSlice";

function Courses() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const isStudent = role === "student";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [enrolling, setEnrolling] = useState(null);

  // When the page loads, fetch all courses from the backend
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await courseApi.getAllCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  async function handleSelfEnroll(courseId) {
    setEnrolling(courseId);
    try {
      await courseApi.selfEnroll(courseId);
      // Refresh courses to update enrollment status
      const data = await courseApi.getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(null);
    }
  }

  // Filter by search text
  const filtered = courses.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.CourseName?.toLowerCase().includes(q) ||
      c.CourseCode?.toLowerCase().includes(q) ||
      c.instructor?.name?.toLowerCase().includes(q) ||
      c.semester?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Courses</h1>
            <p>Browse all the courses offered this semester.</p>
          </div>
          {(role === "teacher" || role === "superadmin") && (
            <button className="console-btn" onClick={() => navigate("/manage")}>
              + Add / Edit Courses
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <input
          placeholder="Search by name, code, instructor, or semester…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        {search && (
          <button className="mini-btn" onClick={() => setSearch("")}>Clear</button>
        )}
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Courses list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>{search ? "No courses match your search" : "No Courses Available"}</h3>
          <p>{search ? "Try a different search term." : "Courses will appear here once they are added."}</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filtered.map((course) => {
            const enrolled = course.enrolledStudents?.length || 0;
            return (
              <div
                key={course._id}
                className="course-card clickable"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <div className="course-icon"></div>
                <div className="course-details">
                  <h3>{course.CourseName}</h3>
                  <div className="course-meta-row">
                    <span className="course-code-badge">{course.CourseCode}</span>
                    {course.credits && <span className="mini-tag">{course.credits} cr</span>}
                  </div>
                  {course.instructor?.name && (
                    <p className="course-instructor">{course.instructor.name}</p>
                  )}
                  <div className="course-footer">
                    <span className="muted">{enrolled} enrolled</span>
                    {isStudent && (
                      <button
                        className="mini-btn"
                        disabled={enrolling === course._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelfEnroll(course._id);
                        }}
                      >
                        {enrolling === course._id ? "…" : "Enroll"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Courses;
