// Dashboard - The home page after login
// This is like the main notice board of the college - shows everything at a glance!
// 🎭 Has TWO modes:
//    • Student View — shows enrolled courses, assignments, marks
//    • Teacher View — shows courses you teach, students, pending grading

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { courseApi, assignmentApi, marksApi } from "../services/api";
import { Link } from "react-router-dom";
import { selectUser, selectViewMode } from "../store/authSlice";

function Dashboard() {
  // Get the currently logged-in user's info from Redux
  const user = useSelector(selectUser);
  const viewMode = useSelector(selectViewMode);

  // State to store data we fetch from the backend
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // When this page loads, fetch all the data from the backend
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch courses and assignments
        const [coursesData, assignmentsData] = await Promise.all([
          courseApi.getAllCourses(),
          assignmentApi.getAllAssignments(),
        ]);

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

        // Also fetch marks if we're in student view or have a user ID
        if (user?._id) {
          try {
            const marksData = await marksApi.getMarksByStudent(user._id);
            setMarks(Array.isArray(marksData) ? marksData : []);
          } catch {
            // Marks might not exist yet — that's okay
            setMarks([]);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, viewMode]);

  // Calculate overall marks percentage
  const totalMarksObtained = marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
  const totalMarksPossible = marks.reduce((sum, m) => sum + (m.totalMarks || 0), 0);
  const overallPercentage = totalMarksPossible > 0
    ? ((totalMarksObtained / totalMarksPossible) * 100).toFixed(1)
    : null;

  // Filter courses based on view mode
  // Teacher view: courses they teach
  // Student view: all courses
  const displayedCourses = viewMode === "teacher" && user?._id
    ? courses.filter(c => c.instructor === user._id || c.instructor?._id === user._id)
    : courses;

  // Show a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* ============================================================ */}
      {/* 👋 WELCOME — Different message for teacher vs student        */}
      {/* ============================================================ */}
      <div className="welcome-section">
        <h1>Welcome, {user?.name || "User"}!</h1>
        {viewMode === "teacher" ? (
          <p>👨‍🏫 Faculty Dashboard — manage your courses, assignments, and students at a glance.</p>
        ) : (
          <p>🎓 Student Dashboard — here's your academic overview at a glance.</p>
        )}
      </div>

      {/* ============================================================ */}
      {/* 📊 STATS CARDS — Different for teacher vs student            */}
      {/* ============================================================ */}
      <div className="stats-grid">
        <div className="stat-card courses-stat">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>{displayedCourses.length}</h3>
            <p>{viewMode === "teacher" ? "My Courses" : "Total Courses"}</p>
          </div>
        </div>

        <div className="stat-card assignments-stat">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>{assignments.length}</h3>
            <p>Assignments</p>
          </div>
        </div>

        {viewMode === "student" ? (
          <div className="stat-card marks-stat">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <h3>{overallPercentage !== null ? `${overallPercentage}%` : "—"}</h3>
              <p>Overall Marks</p>
            </div>
          </div>
        ) : (
          <div className="stat-card marks-stat">
            <div className="stat-icon"></div>
            <div className="stat-info">
              <h3>{marks.length}</h3>
              <p>Submissions</p>
            </div>
          </div>
        )}

        <div className="stat-card profile-stat">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>{user?.email || "N/A"}</h3>
            <p>Email</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🎯 QUICK LINKS — Different for teacher vs student            */}
      {/* ============================================================ */}
      <div className="quick-links">
        <h2>{viewMode === "teacher" ? "Quick Actions" : "Quick Links"}</h2>
        <div className="links-grid">
          {viewMode === "teacher" ? (
            <>
              <Link to="/courses" className="quick-link-card">
                <span className="link-text">My Courses</span>
                <span className="link-arrow">→</span>
              </Link>
              <Link to="/assignments" className="quick-link-card">
                <span className="link-text">Assignments</span>
                <span className="link-arrow">→</span>
              </Link>
              <Link to="/marks" className="quick-link-card">
                <span className="link-text">Student Marks</span>
                <span className="link-arrow">→</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/courses" className="quick-link-card">
                <span className="link-text">View Courses</span>
                <span className="link-arrow">→</span>
              </Link>
              <Link to="/assignments" className="quick-link-card">
                <span className="link-text">View Assignments</span>
                <span className="link-arrow">→</span>
              </Link>
              <Link to="/marks" className="quick-link-card">
                <span className="link-text">Check Marks</span>
                <span className="link-arrow">→</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 📋 DETAILED SECTIONS                                         */}
      {/* ============================================================ */}

      {/* 👨‍🏫 Teacher: Show courses they teach */}
      {viewMode === "teacher" && displayedCourses.length > 0 && (
        <div className="dashboard-section" style={{ marginTop: 40 }}>
          <h2 className="section-title">📚 Courses You Teach</h2>
          <div className="dashboard-teacher-courses">
            {displayedCourses.map((course) => (
              <div key={course._id} className="teacher-course-row">
                <div className="teacher-course-info">
                  <h3>{course.CourseName}</h3>
                  <span className="course-code-badge">{course.CourseCode}</span>
                </div>
                <span className="teacher-course-meta">
                  {course.enrolledStudents?.length || 0} students enrolled
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎓 Student: Show their marks summary */}
      {viewMode === "student" && marks.length > 0 && (
        <div className="dashboard-section" style={{ marginTop: 40 }}>
          <h2 className="section-title">📊 Recent Marks</h2>
          <div className="dashboard-marks-list">
            {marks.slice(0, 5).map((mark) => (
              <div key={mark._id} className="marks-mini-row">
                <span className="marks-mini-course">{mark.courseName}</span>
                <span className="marks-mini-score">
                  {mark.marksObtained}/{mark.totalMarks}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
