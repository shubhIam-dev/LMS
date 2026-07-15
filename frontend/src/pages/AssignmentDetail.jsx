// AssignmentDetail — a student opens an assignment, answers the questions,
// and submits. Teachers land here too (read-only view of the questions).
//
// Route: /assignments/:id   (any signed-in user)

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { assignmentApi, submissionApi } from "../services/api";
import { selectUser, selectRole } from "../store/authSlice";

function AssignmentDetail() {
  const { id } = useParams();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const isStudent = role === "student";

  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});      // questionId → text
  const [existing, setExisting] = useState(null);  // my previous submission, if any
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const a = await assignmentApi.getAssignmentById(id);
        setAssignment(a);
        // Has this student already submitted this assignment?
        if (user?._id) {
          const mine = await submissionApi.getByStudent(user._id);
          setExisting(mine.find((s) => String(s.assignmentId?._id || s.assignmentId) === String(a._id)) || null);
        }
      } catch {
        setError("Could not load this assignment.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user?._id]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await submissionApi.submit({
        assignmentId: assignment._id,
        studentId: user._id,
        answers: (assignment.questions || []).map((q) => ({
          questionId: q._id,
          answer: answers[q._id] || "",
        })),
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page-content"><div className="loading-spinner">Loading assignment…</div></div>;
  if (!assignment) return <div className="page-content"><div className="empty-state"><div className="empty-icon"></div><h3>Not found</h3><p>{error || "This assignment doesn't exist."}</p></div></div>;

  const submitted = done || existing;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{assignment.assignmentName}</h1>
        <p>
          {assignment.courseId?.CourseName} · {assignment.assignmentType} · {assignment.totalMarks} marks
          {assignment.dueOn && ` · due ${new Date(assignment.dueOn).toLocaleDateString()}`}
        </p>
      </div>

      <p className="back-link"><Link to="/assignments">← All assignments</Link></p>

      {error && <div className="error-message">{error}</div>}

      {/* Already submitted (or just now) → status instead of the form */}
      {isStudent && submitted && (
        <div className="console-card wide">
          <h3>Submitted ✓</h3>
          <p className="muted">
            {done
              ? "Your answers are in. Your teacher will grade them — check the Marks page later."
              : existing?.status === "graded"
                ? `Graded: ${existing.marksAwarded}/${assignment.totalMarks}. See the Marks page for details.`
                : "You've already submitted this assignment. Your teacher will grade it soon."}
          </p>
        </div>
      )}

      {/* The answer form (students who haven't submitted) */}
      {isStudent && !submitted && (
        <form className="console-card wide" onSubmit={submit}>
          <h3>Your answers</h3>
          {(assignment.questions || []).map((q, i) => (
            <div className="answer-block" key={q._id}>
              <p className="answer-q"><span className="q-num">Q{i + 1}</span> {q.text} <span className="muted">({q.marks}m)</span></p>

              {q.questionType === "mcq" && (
                <div className="option-list">
                  {(q.options || []).map((opt) => (
                    <label key={opt} className={`pick-row ${answers[q._id] === opt ? "on" : ""}`}>
                      <input
                        type="radio"
                        name={q._id}
                        checked={answers[q._id] === opt}
                        onChange={() => setAnswers({ ...answers, [q._id]: opt })}
                      />
                      <span className="pick-text">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.questionType === "truefalse" && (
                <div className="option-list">
                  {["true", "false"].map((opt) => (
                    <label key={opt} className={`pick-row ${answers[q._id] === opt ? "on" : ""}`}>
                      <input
                        type="radio"
                        name={q._id}
                        checked={answers[q._id] === opt}
                        onChange={() => setAnswers({ ...answers, [q._id]: opt })}
                      />
                      <span className="pick-text">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {!["mcq", "truefalse"].includes(q.questionType) && (
                <textarea
                  rows={q.questionType === "short" ? 2 : 5}
                  placeholder="Type your answer…"
                  value={answers[q._id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                />
              )}
            </div>
          ))}

          <button className="console-btn" disabled={busy}>
            {busy ? "Submitting…" : "Submit assignment"}
          </button>
        </form>
      )}

      {/* Teachers see the questions read-only */}
      {!isStudent && (
        <div className="console-card wide">
          <h3>Questions <span className="count-pill">{assignment.questions?.length || 0}</span></h3>
          <ul className="console-list">
            {(assignment.questions || []).map((q, i) => (
              <li key={q._id} className="question-row">
                <div className="q-main">
                  <strong>Q{i + 1}. {q.text}</strong>
                  <div className="q-tags">
                    <span className="mini-tag">{q.questionType}</span>
                    {q.topic && <span className="mini-tag">{q.topic}</span>}
                    {q.correctAnswer && <span className="mini-tag">ans: {q.correctAnswer}</span>}
                  </div>
                </div>
                <span>{q.marks}m</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetail;
