// Assignments - Shows all assignments
// This is like the assignment notice board - lists every homework/project!

import { useState, useEffect } from "react";
import { assignmentApi, questionApi } from "../services/api";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignment,setSelectedAssignments]=useState(null)
  const [answers, setAnswers] = useState({});

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

  // ----- Detail View: Show questions of the selected assignment ----- //
  if (selectedAssignment) {
    const assignment = selectedAssignment;
    const questions = assignment.questions || [];

    // Helper to get a user-friendly name for each question type
    function getQuestionTypeLabel(type) {
      const labels = {
        mcq: "MCQ",
        short: "Short Answer",
        long: "Long Answer",
        code: "Code",
        truefalse: "True/False",
      };
      return labels[type] || type;
    }

    // Handle deleting a question
    async function handleDeleteQuestion(questionId) {
      if (!window.confirm("Are you sure you want to delete this question? This cannot be undone.")) {
        return;
      }
      try {
        await questionApi.deleteQuestion(questionId);
        // Update the selected assignment to remove the deleted question from local state
        setSelectedAssignments(prev => ({
          ...prev,
          questions: prev.questions.filter(q => q._id !== questionId)
        }));
        // Also clean up any answers for this question
        setAnswers(prev => {
          const updated = { ...prev };
          delete updated[questionId];
          return updated;
        });
      } catch (err) {
        console.error("Failed to delete question:", err);
        alert("Failed to delete question. Please try again.");
      }
    }

    // Handle answering a question (MCQ, TrueFalse, or Short Answer)
    function handleAnswer(questionId, selectedValue) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: { selected: selectedValue, checked: true }
      }));
    }

    // Get the style for an option pill based on whether user answered right/wrong
    function getOptionStyle(q, opt, hasAnswered, isSelected) {
      const isCorrect = opt === q.correctAnswer;

      if (!hasAnswered) {
        // Not answered yet — default look
        return {
          padding: "6px 14px",
          background: "var(--paper)",
          border: "1px solid var(--line-strong)",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--ink-2)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        };
      }

      // User has answered
      if (isCorrect) {
        // Correct answer is always green
        return {
          padding: "6px 14px",
          background: "var(--success-soft)",
          border: "1px solid var(--success)",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--success)",
          cursor: "default",
          transition: "all 0.15s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        };
      }

      if (isSelected && !isCorrect) {
        // User picked this wrong option — red
        return {
          padding: "6px 14px",
          background: "var(--danger-soft)",
          border: "1px solid var(--danger)",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--danger)",
          cursor: "default",
          transition: "all 0.15s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        };
      }

      // Other unselected options — dimmed after answering
      return {
        padding: "6px 14px",
        background: "transparent",
        border: "1px solid var(--line)",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 400,
        color: "var(--muted-2)",
        cursor: "default",
        transition: "all 0.15s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      };
    }

    // Render the appropriate answer area based on question type
    function renderAnswerArea(q) {
      const userAnswer = answers[q._id];
      const hasAnswered = !!userAnswer?.checked;

      // ---- MCQ ----
      if (q.questionType === "mcq" && q.options?.length > 0) {
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {q.options.map((opt, i) => {
              const isSelected = userAnswer?.selected === opt;
              return (
                <span
                  key={i}
                  onClick={() => !hasAnswered && handleAnswer(q._id, opt)}
                  style={getOptionStyle(q, opt, hasAnswered, isSelected)}
                  onMouseOver={(e) => {
                    if (!hasAnswered) {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.color = "var(--primary)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!hasAnswered) {
                      e.currentTarget.style.borderColor = "var(--line-strong)";
                      e.currentTarget.style.color = "var(--ink-2)";
                    }
                  }}
                >
                  {hasAnswered && opt === q.correctAnswer ? "✓ " : ""}
                  {hasAnswered && isSelected && opt !== q.correctAnswer ? "✗ " : ""}
                  {opt}
                </span>
              );
            })}
          </div>
        );
      }

      // ---- True / False ----
      if (q.questionType === "truefalse") {
        const tfOptions = ["true", "false"];
        return (
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {tfOptions.map((opt) => {
              const isSelected = userAnswer?.selected === opt;
              return (
                <span
                  key={opt}
                  onClick={() => !hasAnswered && handleAnswer(q._id, opt)}
                  style={{
                    ...getOptionStyle(q, opt, hasAnswered, isSelected),
                    minWidth: "60px",
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontWeight: hasAnswered && (opt === q.correctAnswer || isSelected) ? 700 : 500,
                    fontSize: "12px",
                    letterSpacing: "0.06em",
                  }}
                  onMouseOver={(e) => {
                    if (!hasAnswered) {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.color = "var(--primary)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!hasAnswered) {
                      e.currentTarget.style.borderColor = "var(--line-strong)";
                      e.currentTarget.style.color = "var(--ink-2)";
                    }
                  }}
                >
                  {hasAnswered && opt === q.correctAnswer ? "✓ " : ""}
                  {hasAnswered && isSelected && opt !== q.correctAnswer ? "✗ " : ""}
                  {opt}
                </span>
              );
            })}
          </div>
        );
      }

      // ---- Short Answer ----
      if (q.questionType === "short") {
        // Track input text locally per question using a dedicated sub-state
        const inputKey = `short_input_${q._id}`;
        const typedValue = answers[inputKey]?.selected || "";

        function updateTypedValue(value) {
          setAnswers(prev => ({
            ...prev,
            [inputKey]: { selected: value, checked: false }
          }));
        }

        return (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Type your answer..."
                value={!hasAnswered ? typedValue : userAnswer.selected}
                disabled={hasAnswered}
                onChange={(e) => !hasAnswered && updateTypedValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim() && !hasAnswered) {
                    handleAnswer(q._id, e.target.value.trim());
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: hasAnswered
                    ? `1px solid ${userAnswer.selected.toLowerCase() === q.correctAnswer.toLowerCase() ? "var(--success)" : "var(--danger)"}`
                    : "1px solid var(--line-strong)",
                  borderRadius: "var(--radius)",
                  fontSize: "14px",
                  background: hasAnswered ? "var(--paper)" : "var(--card)",
                  color: "var(--ink)",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
              {!hasAnswered && (
                <button
                  onClick={() => typedValue.trim() && handleAnswer(q._id, typedValue.trim())}
                  style={{
                    padding: "10px 18px",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Check
                </button>
              )}
            </div>
            {hasAnswered && (
              <div style={{ marginTop: "8px", fontSize: "13px", fontWeight: 500, color: userAnswer.selected.toLowerCase() === q.correctAnswer.toLowerCase() ? "var(--success)" : "var(--danger)" }}>
                {userAnswer.selected.toLowerCase() === q.correctAnswer.toLowerCase()
                  ? "✓ Correct!"
                  : `✗ Incorrect. Correct answer: ${q.correctAnswer}`}
              </div>
            )}
          </div>
        );
      }

      // ---- Long Answer / Code (just placeholder for now) ----
      if (q.questionType === "long" || q.questionType === "code") {
        return (
          <div style={{ marginBottom: "12px" }}>
            <textarea
              placeholder={q.questionType === "code" ? "Write your code here..." : "Write your answer here..."}
              rows={4}
              disabled
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--line-strong)",
                borderRadius: "var(--radius)",
                fontSize: "14px",
                fontFamily: q.questionType === "code" ? "monospace" : "inherit",
                background: "var(--paper)",
                color: "var(--muted)",
                resize: "vertical",
                outline: "none",
              }}
            />
            <p style={{ fontSize: "11px", color: "var(--muted-2)", marginTop: "6px" }}>
              Answer checking coming soon for this question type.
            </p>
          </div>
        );
      }

      return null;
    }

    return (
      <div className="page-content">
        <div className="page-header">
          <div>
            <button
              onClick={() => {
                setSelectedAssignments(null);
                setAnswers({});
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: 0,
                marginBottom: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "opacity 0.15s",
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              ← Back to Assignments
            </button>
            <h1>{assignment.assignmentName || "Untitled Assignment"}</h1>
          </div>
          <p>
            {assignment.assignmentType && (
              <span
                className="assignment-type-badge"
                style={{
                  backgroundColor: getAssignmentTypeColor(assignment.assignmentType),
                  display: "inline-block",
                  marginBottom: "8px",
                }}
              >
                {assignment.assignmentType}
              </span>
            )}
            <br />
            Due: {formatDate(assignment.dueOn)}
          </p>
        </div>

        {assignment.assignmentTopics?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "28px" }}>
            {assignment.assignmentTopics.map((topic, index) => (
              <span key={index} className="topic-tag">{topic}</span>
            ))}
          </div>
        )}

        {/* Score summary */}
        {questions.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
            padding: "12px 20px",
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            fontSize: "13px",
            color: "var(--muted)",
          }}>
            <span style={{ fontWeight: 600, color: "var(--ink)" }}>
              {questions.length} {questions.length === 1 ? "Question" : "Questions"}
            </span>
            {Object.keys(answers).length > 0 && (
              <span style={{ color: "var(--success)", fontWeight: 600 }}>
                {Object.entries(answers).filter(([qId, a]) => !qId.startsWith("short_input_") && a.checked).length} answered
              </span>
            )}
            <span style={{ marginLeft: "auto", display: "flex", gap: "16px" }}>
              <span style={{ color: "var(--success)", fontWeight: 600 }}>
                ✓ {Object.entries(answers).filter(([qId, a]) => {
                  if (qId.startsWith("short_input_")) return false;
                  const q = questions.find(qq => qq._id === qId);
                  return a.checked && a.selected?.toLowerCase() === q?.correctAnswer?.toLowerCase();
                }).length} correct
              </span>
              <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                ✗ {Object.entries(answers).filter(([qId, a]) => {
                  if (qId.startsWith("short_input_")) return false;
                  const q = questions.find(qq => qq._id === qId);
                  return a.checked && a.selected?.toLowerCase() !== q?.correctAnswer?.toLowerCase();
                }).length} wrong
              </span>
            </span>
          </div>
        )}

        {questions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No Questions Yet</h3>
            <p>This assignment doesn't have any questions. Questions will appear here once they are added.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {questions.map((q, index) => {
              const userAnswer = answers[q._id];
              const hasAnswered = !!userAnswer?.checked;
              const isCorrect = hasAnswered && userAnswer.selected?.toLowerCase() === q.correctAnswer?.toLowerCase();

              return (
                <div
                  key={q._id}
                  style={{
                    background: "var(--card)",
                    border: `1px solid ${hasAnswered ? (isCorrect ? "var(--success)" : "var(--danger)") : "var(--line)"}`,
                    borderLeft: `4px solid ${hasAnswered ? (isCorrect ? "var(--success)" : "var(--danger)") : "var(--line)"}`,
                    borderRadius: "var(--radius)",
                    padding: "20px 24px",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Question number */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: hasAnswered ? (isCorrect ? "var(--success-soft)" : "var(--danger-soft)") : "var(--paper-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: hasAnswered ? (isCorrect ? "var(--success)" : "var(--danger)") : "var(--ink-2)",
                      flexShrink: 0,
                      border: `1px solid ${hasAnswered ? (isCorrect ? "var(--success)" : "var(--danger)") : "var(--line-strong)"}`,
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Question content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--ink)", marginBottom: "12px", lineHeight: 1.4 }}>
                      {q.text}
                    </p>

                    {/* Interactive answer area */}
                    {renderAnswerArea(q)}

                    {/* Delete button */}
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        style={{
                          padding: "6px 14px",
                          background: "transparent",
                          border: "1px solid var(--danger)",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "var(--danger)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "var(--danger-soft)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    {/* Question meta badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "var(--primary-soft)",
                          color: "var(--primary)",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          borderRadius: "999px",
                        }}
                      >
                        {getQuestionTypeLabel(q.questionType)}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "var(--accent-soft)",
                          color: "#8B6914",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          borderRadius: "999px",
                        }}
                      >
                        {q.marks} {q.marks === 1 ? "mark" : "marks"}
                      </span>
                      {q.difficulty && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          {q.difficulty}
                        </span>
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

  // ----- List View: Show all assignments ----- //
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
            <div key={assignment._id} className="assignment-card" onClick={() => setSelectedAssignments(assignment)}>
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
