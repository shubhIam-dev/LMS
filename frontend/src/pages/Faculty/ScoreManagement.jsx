// ScoreManagement — Faculty Score Management Page
//
// This is the main page where faculty select a course and see all enrolled
// students with their current scores. Clicking "Edit" on any student opens
// the detailed score editing form (StudentScoreForm).
//
// Flow:
//   Faculty Login → Dashboard → Score Management → Select Course
//   → View all enrolled students → Click "Edit" → Score Form

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseApi } from "../../services/api";
import { facultyScoreApi } from "../../services/facultyScoreApi";
import "./FacultyScore.css";

function ScoreManagement() {
  // ── State ──────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);          // All available courses
  const [selectedCourseId, setSelectedCourseId] = useState("");  // Currently selected course
  const [courseData, setCourseData] = useState(null);   // Course info + students
  const [loading, setLoading] = useState(false);        // Loading state for students
  const [error, setError] = useState("");               // Error message

  const navigate = useNavigate();

  // ── Fetch all courses when page loads ─────────────────────────
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await courseApi.getAllCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Could not load courses. Please try again later.");
      }
    }
    fetchCourses();
  }, []);

  // ── When course selection changes, fetch enrolled students ─────
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseData(null);
      return;
    }

    async function fetchStudents() {
      setLoading(true);
      setError("");
      try {
        const data = await facultyScoreApi.getCourseStudents(selectedCourseId);
        setCourseData(data);
      } catch (err) {
        console.error("Failed to load students:", err);
        setError("Could not load students for this course. Make sure students are enrolled.");
        setCourseData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [selectedCourseId]);

  // ── Handle course selection change ─────────────────────────────
  function handleCourseChange(e) {
    setSelectedCourseId(e.target.value);
  }

  // ── Navigate to score editing page for a student ───────────────
  function handleEditStudent(student) {
    // If a score record exists, pass its _id; otherwise pass null to create a new one
    const scoreId = student.score?._id || null;
    navigate(
      `/faculty/score-form/${selectedCourseId}/${student._id}`,
      {
        state: {
          student,
          course: courseData?.course,
          scoreId
        }
      }
    );
  }

  // ── Format percentage for display ──────────────────────────────
  function formatPercentage(value) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return `${value}%`;
  }

  // ── Get CSS class based on percentage ──────────────────────────
  function getPctClass(pct) {
    if (pct >= 75) return "fm-pct-excellent";
    if (pct >= 60) return "fm-pct-good";
    if (pct > 0) return "fm-pct-poor";
    return "";
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <h1>
          <em>Score</em> Management
        </h1>
        <p>
          Select a course to view enrolled students and manage their scores.
        </p>
      </div>

      {/* Course Selector */}
      <div className="fm-course-selector">
        <label htmlFor="course-select">Select Course</label>
        <select
          id="course-select"
          value={selectedCourseId}
          onChange={handleCourseChange}
          className="fm-select"
        >
          <option value="">— Choose a course —</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.CourseName} ({course.CourseCode})
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && <div className="fm-error">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="fm-loading">Loading students...</div>
      )}

      {/* Student Table */}
      {courseData && !loading && (
        <div className="fm-student-table-wrapper">
          {/* Course info bar */}
          <div className="fm-course-info-bar">
            <span className="fm-course-name">{courseData.course.CourseName}</span>
            <span className="fm-course-code">{courseData.course.CourseCode}</span>
            {courseData.course.credits && (
              <span className="fm-course-meta">{courseData.course.credits} Credits</span>
            )}
            <span className="fm-student-count">
              {courseData.students.length} Student{courseData.students.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Student table */}
          <div className="fm-table-responsive">
            <table className="fm-student-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Current Percentage</th>
                  <th>GPA</th>
                  <th>Attendance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {courseData.students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="fm-table-empty">
                      No students are enrolled in this course yet.
                    </td>
                  </tr>
                ) : (
                  courseData.students.map((student, index) => {
                    const pct = student.score?.overallPercentage;
                    const attPct = student.score?.attendancePercentage;
                    const gpa = student.score?.gpa;

                    return (
                      <tr key={student._id}>
                        <td className="fm-cell-index">{index + 1}</td>
                        <td className="fm-cell-name">{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.phoneNumber || "—"}</td>
                        <td>
                          <span className={`fm-pct-badge ${getPctClass(pct)}`}>
                            {pct !== undefined ? formatPercentage(pct) : "—"}
                          </span>
                        </td>
                        <td className="fm-cell-gpa">
                          {gpa !== undefined && gpa > 0 ? gpa.toFixed(2) : "—"}
                        </td>
                        <td>
                          <span className={`fm-pct-badge ${getPctClass(attPct)}`}>
                            {attPct !== undefined ? formatPercentage(attPct) : "—"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="fm-edit-btn"
                            onClick={() => handleEditStudent(student)}
                          >
                            {student.score ? "Edit" : "Add Score"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No course selected yet */}
      {!selectedCourseId && !loading && (
        <div className="fm-empty-state">
          <div className="fm-empty-icon">📋</div>
          <h3>Select a Course</h3>
          <p>
            Choose a course from the dropdown above to view enrolled students
            and manage their academic scores.
          </p>
        </div>
      )}
    </div>
  );
}

export default ScoreManagement;
