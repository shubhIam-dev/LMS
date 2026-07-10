// Courses - Shows all available courses
// This is like the college course catalog - lists every course offered!

import { useState, useEffect } from "react";
import { courseApi } from "../services/api";

function Courses() {
  // State to store courses data and loading status
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // When the page loads, fetch all courses from the backend
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await courseApi.getAllCourses();
        // Make sure data is an array before setting it
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

  // Show loading spinner
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
        <h1>Courses</h1>
        <p>Browse all the courses offered this semester.</p>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Courses list */}
      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>No Courses Available</h3>
          <p>Courses will appear here once they are added by the administration.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-icon"></div>
              <div className="course-details">
                <h3>{course.CourseName}</h3>
                <div className="course-code-badge">{course.CourseCode}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;
