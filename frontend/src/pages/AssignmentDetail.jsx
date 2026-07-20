// AssignmentDetail — a student opens an assignment, answers the questions,
// and submits. Teachers land here too (read-only view of the questions).
//
// Route: /assignments/:id   (any signed-in user)

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { assignmentApi, submissionApi, questionApi } from "../services/api";
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
  const [editingQ, setEditingQ] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("add");   // "add" or "replace"
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [pickerFilters, setPickerFilters] = useState({ q: "", topic: "", difficulty: "", questionType: "" });
  const [pickedIds, setPickedIds] = useState([]);
  const [pickerBusy, setPickerBusy] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);

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

  // ── Faculty: edit question ──
  function openEdit(q) {
    setEditingQ(q._id);
    setEditForm({
      text: q.text,
      marks: q.marks,
      topic: q.topic || "",
      difficulty: q.difficulty || "medium",
      questionType: q.questionType,
    });
  }

  function closeEdit() {
    setEditingQ(null);
    setEditForm({});
  }

  async function saveEdit(qId) {
    try {
      await questionApi.update(qId, { ...editForm, marks: Number(editForm.marks) });
      const a = await assignmentApi.getAssignmentById(id);
      setAssignment(a);
      closeEdit();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteQuestion(qId) {
    if (!window.confirm("Delete this question? It will be removed from the shared bank.")) return;
    try {
      await questionApi.delete(qId);
      const a = await assignmentApi.getAssignmentById(id);
      setAssignment(a);
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Faculty: remove question from assignment (not delete from bank) ──
  async function removeFromAssignment(qId) {
    if (!window.confirm("Remove this question from the assignment? It stays in the shared bank.")) return;
    try {
      const current = (assignment.questions || []).map((q) => String(q._id));
      const filtered = current.filter((id) => id !== String(qId));
      await assignmentApi.updateAssignment({ id: assignment._id, questions: filtered });
      const a = await assignmentApi.getAssignmentById(id);
      setAssignment(a);
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Faculty: question picker (add / replace) ──
  function openPicker(mode, replaceQId) {
    setPickerMode(mode);
    setReplaceTarget(replaceQId || null);
    setPickedIds([]);
    setPickerFilters({ q: "", topic: "", difficulty: "", questionType: "" });
    setShowPicker(true);
    setPickerLoading(true);
    // Load the shared question bank
    questionApi.getAll().then(setAllQuestions).catch(() => {}).finally(() => setPickerLoading(false));
  }

  function closePicker() {
    setShowPicker(false);
    setPickedIds([]);
    setReplaceTarget(null);
  }

  function togglePick(qId) {
    setPickedIds((p) =>
      pickerMode === "replace"
        ? [qId]   // single-select in replace mode
        : p.includes(qId) ? p.filter((x) => x !== qId) : [...p, qId]
    );
  }

  async function confirmPicker() {
    if (pickedIds.length === 0) return;
    setPickerBusy(true);
    try {
      if (pickerMode === "add") {
        // Append selected questions to the assignment
        await assignmentApi.addQuestionsToAssignment(assignment._id, pickedIds);
      } else if (pickerMode === "replace") {
        // Swap the replaced question with the selected one in the questions array
        const current = (assignment.questions || []).map((q) => String(q._id));
        const idx = current.indexOf(String(replaceTarget));
        if (idx !== -1) {
          current[idx] = pickedIds[0];
          await assignmentApi.updateAssignment({ id: assignment._id, questions: current });
        }
      }
      const a = await assignmentApi.getAssignmentById(id);
      setAssignment(a);
      closePicker();
    } catch (err) {
      setError(err.message);
    } finally {
      setPickerBusy(false);
    }
  }

  if (loading) return <div className="page-content"><div className="loading-spinner">Loading assignment…</div></div>;
  if (!assignment) return <div className="page-content"><div className="empty-state"><div className="empty-icon"></div><h3>Not found</h3><p>{error || "This assignment doesn't exist."}</p></div></div>;

  const submitted = done || existing;
  const assignedIds = new Set((assignment.questions || []).map(q => String(q._id)));

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

      {/* Teachers see the questions with Edit / Replace / Delete buttons */}
      {!isStudent && (
        <div className="console-card wide">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Questions <span className="count-pill">{assignment.questions?.length || 0}</span></h3>
            <button type="button" className="mini-btn" onClick={() => openPicker("add")}>
              + Add questions
            </button>
          </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ marginRight: 4, fontSize: 14 }}>{q.marks}m</span>
                  <button type="button" className="mini-btn" onClick={() => removeFromAssignment(q._id)} title="Remove from assignment (kept in bank)">✕</button>
                  <button type="button" className="mini-btn" onClick={() => openPicker("replace", q._id)} title="Replace with another question">🔄</button>
                  <button type="button" className="mini-btn" onClick={() => openEdit(q)} title="Edit question">✏️</button>
                  <button type="button" className="mini-btn" style={{ color: "var(--danger, #DC2626)" }} onClick={() => deleteQuestion(q._id)} title="Delete from shared bank">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Edit question modal ── */}
      {editingQ && (
        <div className="console-card wide" style={{ marginTop: 16 }}>
          <h3>Edit question</h3>
          <label className="field">
            <span className="field-label">Question text</span>
            <textarea rows="3" value={editForm.text} onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} />
          </label>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Marks</span>
              <input type="number" min="1" value={editForm.marks} onChange={(e) => setEditForm({ ...editForm, marks: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label">Topic</span>
              <input value={editForm.topic} onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })} />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Difficulty</span>
              <select value={editForm.difficulty} onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Type</span>
              <select value={editForm.questionType} onChange={(e) => setEditForm({ ...editForm, questionType: e.target.value })}>
                <option value="short">Short</option>
                <option value="long">Long</option>
                <option value="mcq">MCQ</option>
                <option value="truefalse">True/False</option>
                <option value="code">Code</option>
              </select>
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="console-btn" onClick={() => saveEdit(editingQ)}>Save changes</button>
            <button type="button" className="mini-btn" onClick={closeEdit}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Question picker (add / replace) ── */}
      {showPicker && (
        <div className="console-card wide" style={{ marginTop: 16 }}>
          <h3>
            {pickerMode === "add"
              ? `Add questions to "${assignment.assignmentName}"`
              : `Replace question`}
            <span className="count-pill" style={{ marginLeft: 8 }}>{pickedIds.length} selected</span>
          </h3>
          <p className="muted hint">
            {pickerMode === "add"
              ? "Pick from the shared question bank to add to this assignment."
              : "Select one question to replace the current one."}
          </p>

          {/* Filter bar */}
          <div className="filter-bar">
            <input
              placeholder="Search text…"
              value={pickerFilters.q}
              onChange={(e) => setPickerFilters({ ...pickerFilters, q: e.target.value })}
            />
            <input
              placeholder="Topic…"
              value={pickerFilters.topic}
              onChange={(e) => setPickerFilters({ ...pickerFilters, topic: e.target.value })}
            />
            <select value={pickerFilters.difficulty} onChange={(e) => setPickerFilters({ ...pickerFilters, difficulty: e.target.value })}>
              <option value="">Any difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select value={pickerFilters.questionType} onChange={(e) => setPickerFilters({ ...pickerFilters, questionType: e.target.value })}>
              <option value="">Any type</option>
              <option value="mcq">MCQ</option>
              <option value="short">Short</option>
              <option value="long">Long</option>
              <option value="truefalse">True/False</option>
              <option value="code">Code</option>
            </select>
          </div>

          {/* Question list */}
          <div className="question-picker" style={{ maxHeight: 320 }}>
            {(() => {
              // Compute filtered questions (client-side)
              const filtered = allQuestions.filter((q) => {
                if (pickerFilters.q && !q.text.toLowerCase().includes(pickerFilters.q.toLowerCase())) return false;
                if (pickerFilters.topic && !(q.topic || "").toLowerCase().includes(pickerFilters.topic.toLowerCase())) return false;
                if (pickerFilters.difficulty && q.difficulty !== pickerFilters.difficulty) return false;
                if (pickerFilters.questionType && q.questionType !== pickerFilters.questionType) return false;
                // In add mode: hide questions already in the assignment
                if (pickerMode === "add" && assignedIds.has(String(q._id))) return false;
                // In replace mode: hide questions already in the assignment (except the one being replaced)
                if (pickerMode === "replace" && assignedIds.has(String(q._id)) && String(q._id) !== String(replaceTarget)) return false;
                return true;
              });
              return (
                <>
                  {pickerLoading && <p className="muted" style={{ padding: 16 }}>Loading questions…</p>}
                  {!pickerLoading && filtered.map((q) => (
                    <label key={q._id} className={`pick-row ${pickedIds.includes(q._id) ? "on" : ""}`}>
                      <input
                        type={pickerMode === "replace" ? "radio" : "checkbox"}
                        name="picker-question"
                        checked={pickedIds.includes(q._id)}
                        onChange={() => togglePick(q._id)}
                      />
                      <span className="pick-text">{q.text}</span>
                      <span className="pick-meta">
                        {q.marks}m · {q.difficulty} · {q.questionType}
                        {q.topic && ` · ${q.topic}`}
                      </span>
                    </label>
                  ))}
                  {!pickerLoading && filtered.length === 0 && (
                    <p className="muted" style={{ padding: 16 }}>
                      {allQuestions.length === 0
                        ? "No questions in the shared bank yet."
                        : "No questions match these filters."}
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="console-btn" onClick={confirmPicker} disabled={pickerBusy || pickedIds.length === 0}>
              {pickerBusy
                ? "Saving…"
                : pickerMode === "add"
                  ? `Add ${pickedIds.length} question(s)`
                  : "Replace"}
            </button>
            <button type="button" className="mini-btn" onClick={closePicker}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetail;
