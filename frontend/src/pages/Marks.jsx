// Marks - Shows student's marks/grades
// This is like your online report card - shows all your scores!

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { marksApi } from "../services/api";
import { selectUser } from "../store/authSlice";

function Marks() {
  const user = useSelector(selectUser);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch marks when page loads
  useEffect(() => {
    async function fetchMarks() {
      try {
        // If we have a user, fetch their marks
        if (user?._id) {
          const data = await marksApi.getMarksByStudent(user._id);
          setMarks(Array.isArray(data) ? data : []);
        } else {
          // If no user ID, try to get all marks
          const data = await marksApi.getAllMarks();
          setMarks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError("Failed to load marks. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMarks();
  }, [user]);

  // Calculate percentage from marks obtained and total marks
  function calculatePercentage(obtained, total) {
    if (!total) return 0;
    return ((obtained / total) * 100).toFixed(1);
  }

  // Pick a color based on percentage (green = good, red = bad)
  function getGradeColor(percentage) {
    if (percentage >= 80) return "#4CAF50"; // Green - Excellent
    if (percentage >= 60) return "#FF9800"; // Orange - Good
    if (percentage >= 35) return "#FFC107"; // Yellow - Average
    return "#f44336"; // Red - Needs improvement
  }

  // Calculate overall stats
  const totalMarksObtained = marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
  const totalMarksPossible = marks.reduce((sum, m) => sum + (m.totalMarks || 0), 0);
  const overallPercentage = calculatePercentage(totalMarksObtained, totalMarksPossible);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">Loading your marks...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>My Marks</h1>
        <p>View your academic performance across all subjects.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Overall Performance Summary */}
      {marks.length > 0 && (
        <div className="performance-summary">
          <div className="summary-card">
            <div className="summary-label">Overall Percentage</div>
            <div
              className="summary-value"
              style={{ color: getGradeColor(overallPercentage) }}
            >
              {overallPercentage}%
            </div>
            <div className="summary-subtitle">
              {overallPercentage >= 80
                ? "Excellent Performance!"
                : overallPercentage >= 60
                ? "Good Job!"
                : overallPercentage >= 35
                ? "Keep Improving!"
                : "Needs More Effort"}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Marks</div>
            <div className="summary-value" style={{ color: "var(--primary)" }}>
              {totalMarksObtained}/{totalMarksPossible}
            </div>
            <div className="summary-subtitle">Across {marks.length} exams</div>
          </div>
        </div>
      )}

      {/* Marks List */}
      {marks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>No Marks Available</h3>
          <p>
            Your marks will appear here once they are published by your teachers.
          </p>
        </div>
      ) : (
        <div className="marks-table-container">
          <table className="marks-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Exam Type</th>
                <th>Semester</th>
                <th>Marks</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark) => {
                const percentage = calculatePercentage(
                  mark.marksObtained,
                  mark.totalMarks
                );
                return (
                  <tr key={mark._id}>
                    <td className="course-name-cell">{mark.courseName}</td>
                    <td>
                      <span className="exam-type-badge">{mark.examType}</span>
                    </td>
                    <td>{mark.semester || "N/A"}</td>
                    <td className="marks-cell">
                      <strong>{mark.marksObtained}</strong>/{mark.totalMarks}
                    </td>
                    <td>
                      <span
                        className="percentage-badge"
                        style={{
                          backgroundColor: getGradeColor(percentage),
                        }}
                      >
                        {percentage}%
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getGradeColor(percentage),
                        }}
                      >
                        {percentage >= 35 ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Marks;
