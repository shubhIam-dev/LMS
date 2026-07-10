// Assignments - Shows all assignments
// This is like the assignment notice board - lists every homework/project!

import { useState, useEffect } from "react";
import { assignmentApi } from "../services/api";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all assignments when page loads
  useEffect(() => {
    async function fetchAssignments() {
      try {
        const data = await assignmentApi.getAllAssignments();
        setAssignments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load assignments. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  // Helper function to format dates nicely
  function formatDate(dateString) {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Helper function to pick a color based on assignment type
  function getAssignmentTypeColor(type) {
    const colors = {
      Homework: "#4CAF50",
      Project: "#FF9800",
      Quiz: "#2196F3",
      Exam: "#f44336",
    };
    return colors[type] || "#9C27B0";
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Assignments</h1>
        <p>Track all your assignments, projects, and deadlines.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>No Assignments Yet</h3>
          <p>No assignments have been posted yet.</p>
        </div>
      ) : (
        <div className="assignments-list">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="assignment-card">
              {/* Left side - colorful type indicator */}
              <div
                className="assignment-type-indicator"
                style={{
                  backgroundColor: getAssignmentTypeColor(assignment.assignmentType),
                }}
              >
                {assignment.assignmentType?.[0] || "A"}
              </div>

              {/* Middle - assignment details */}
              <div className="assignment-info">
                <h3>{assignment.assignmentName || "Untitled Assignment"}</h3>
                {assignment.assignmentTopics?.length > 0 && (
                  <div className="assignment-topics">
                    {assignment.assignmentTopics.map((topic, index) => (
                      <span key={index} className="topic-tag">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                <div className="assignment-meta">
                  {assignment.assignmentType && (
                    <span
                      className="assignment-type-badge"
                      style={{
                        backgroundColor: getAssignmentTypeColor(assignment.assignmentType),
                      }}
                    >
                      {assignment.assignmentType}
                    </span>
                  )}
                  <span className="assignment-date">
                    Due: {formatDate(assignment.dueOn)}
                  </span>
                  <span className="assignment-date">
                    Created: {formatDate(assignment.createdOn)}
                  </span>
                </div>
              </div>

              {/* Right side - question count */}
              {assignment.questions && (
                <div className="assignment-questions-count">
                  <span className="count-number">{assignment.questions.length}</span>
                  <span className="count-label">Questions</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Assignments;
