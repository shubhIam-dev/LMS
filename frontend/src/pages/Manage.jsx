// Manage — the Teacher Console. Staff-only (teacher / superadmin).
//
// Five tabs:
//   1. Courses     — create a course
//   2. Questions   — add to the SHARED question bank; filter everyone's
//                    questions by search / topic / difficulty / type
//   3. Assignments — create an assignment + map questions, or REUSE another
//                    teacher's assignment into your own course
//   4. Students    — the roster: see who's enrolled in a course, enroll more
//   5. Grading     — open submissions for an assignment and award marks
//                    per question (rubric-style)
//
// Every call goes through services/api.js (JWT attached automatically); the
// backend enforces that only teachers/superadmins can hit these endpoints.

import { useState, useEffect, useCallback } from "react";
import { courseApi, questionApi, assignmentApi, userApi, submissionApi } from "../services/api";

function Manage() {
  const [tab, setTab] = useState("courses");
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Teacher Console</h1>
        <p>Create courses, share questions, set up assignments, manage students, and grade.</p>
      </div>

      <div className="console-tabs">
        {[
          ["courses", "Courses"],
          ["questions", "Questions"],
          ["assignments", "Assignments"],
          ["students", "Students"],
          ["grading", "Grading"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`console-tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "courses" && <CoursesTab />}
      {tab === "questions" && <QuestionsTab />}
      {tab === "assignments" && <AssignmentsTab />}
      {tab === "students" && <StudentsTab />}
      {tab === "grading" && <GradingTab />}
    </div>
  );
}

// Green/red status line under each form.
function useFlash() {
  const [flash, setFlash] = useState(null);
  const show = (ok, msg) => {
    setFlash({ ok, msg });
    setTimeout(() => setFlash(null), 4000);
  };
  return [flash, show];
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ Courses */
function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ CourseName: "", CourseCode: "", credits: 3, semester: "" });
  const [busy, setBusy] = useState(false);
  const [flash, show] = useFlash();

  const load = () => courseApi.getAllCourses().then(setCourses).catch(() => {});
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.CourseName || !form.CourseCode) return show(false, "Name and code are required.");
    setBusy(true);
    try {
      await courseApi.addCourse({ ...form, credits: Number(form.credits) });
      show(true, `Created "${form.CourseName}".`);
      setForm({ CourseName: "", CourseCode: "", credits: 3, semester: "" });
      load();
    } catch (err) {
      show(false, err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="console-grid">
      <form className="console-card" onSubmit={submit}>
        <h3>New course</h3>
        <Field label="Course name">
          <input value={form.CourseName} onChange={(e) => setForm({ ...form, CourseName: e.target.value })} placeholder="Data Structures & Algorithms" />
        </Field>
        <Field label="Course code">
          <input value={form.CourseCode} onChange={(e) => setForm({ ...form, CourseCode: e.target.value })} placeholder="CS201" />
        </Field>
        <div className="field-row">
          <Field label="Credits">
            <input type="number" min="1" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
          </Field>
          <Field label="Semester">
            <input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="Fall 2026" />
          </Field>
        </div>
        <button className="console-btn" disabled={busy}>{busy ? "Creating…" : "Create course"}</button>
        {flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}
      </form>

      <div className="console-card">
        <h3>Existing courses <span className="count-pill">{courses.length}</span></h3>
        <ul className="console-list">
          {courses.map((c) => (
            <li key={c._id}><strong>{c.CourseName}</strong><span>{c.CourseCode}</span></li>
          ))}
          {courses.length === 0 && <li className="muted">No courses yet.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Questions */
function QuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ q: "", topic: "", difficulty: "", questionType: "" });
  const [form, setForm] = useState({ text: "", questionType: "short", correctAnswer: "", marks: 1, topic: "", difficulty: "medium" });
  const [busy, setBusy] = useState(false);
  const [flash, show] = useFlash();

  // Reload whenever a filter changes — the backend does the filtering.
  const load = useCallback(() => {
    questionApi.getAll(filters).then(setQuestions).catch(() => {});
  }, [filters]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (!form.text) return show(false, "Question text is required.");
    setBusy(true);
    try {
      await questionApi.add({ ...form, marks: Number(form.marks) });
      show(true, "Question added to the shared bank.");
      setForm({ text: "", questionType: "short", correctAnswer: "", marks: 1, topic: "", difficulty: "medium" });
      load();
    } catch (err) {
      show(false, err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="console-grid">
      <form className="console-card" onSubmit={submit}>
        <h3>New question</h3>
        <Field label="Question">
          <textarea rows="3" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="What is the time complexity of binary search?" />
        </Field>
        <div className="field-row">
          <Field label="Type">
            <select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value })}>
              <option value="short">Short answer</option>
              <option value="long">Long answer</option>
              <option value="mcq">MCQ</option>
              <option value="truefalse">True / False</option>
              <option value="code">Code</option>
            </select>
          </Field>
          <Field label="Marks">
            <input type="number" min="1" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
          </Field>
        </div>
        <div className="field-row">
          <Field label="Correct answer (for auto-grading)">
            <input value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} placeholder="O(log n)" />
          </Field>
          <Field label="Topic">
            <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Complexity" />
          </Field>
        </div>
        <Field label="Difficulty">
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </Field>
        <button className="console-btn" disabled={busy}>{busy ? "Adding…" : "Add question"}</button>
        {flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}
      </form>

      <div className="console-card">
        <h3>Shared question bank <span className="count-pill">{questions.length}</span></h3>
        <p className="muted hint">Questions from every teacher. Filter to find something to reuse.</p>

        {/* Filter bar — hits the backend on every change */}
        <div className="filter-bar">
          <input
            placeholder="Search text…"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <input
            placeholder="Topic…"
            value={filters.topic}
            onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
          />
          <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select value={filters.questionType} onChange={(e) => setFilters({ ...filters, questionType: e.target.value })}>
            <option value="">Any type</option>
            <option value="mcq">MCQ</option>
            <option value="short">Short</option>
            <option value="long">Long</option>
            <option value="truefalse">True/False</option>
            <option value="code">Code</option>
          </select>
        </div>

        <ul className="console-list">
          {questions.map((q) => (
            <li key={q._id} className="question-row">
              <div className="q-main">
                <strong>{q.text}</strong>
                <div className="q-tags">
                  {q.topic && <span className="mini-tag">{q.topic}</span>}
                  <span className={`mini-tag diff-${q.difficulty}`}>{q.difficulty}</span>
                  <span className="mini-tag">{q.questionType}</span>
                  {q.createdBy?.name && <span className="mini-tag author">by {q.createdBy.name}</span>}
                </div>
              </div>
              <span>{q.marks}m</span>
            </li>
          ))}
          {questions.length === 0 && <li className="muted">No questions match these filters.</li>}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Assignments */
function AssignmentsTab() {
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ assignmentName: "", assignmentType: "Homework", courseId: "", dueOn: "" });
  const [picked, setPicked] = useState([]);
  const [reuseCourse, setReuseCourse] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, show] = useFlash();

  const loadAssignments = () => assignmentApi.getAllAssignments().then(setAssignments).catch(() => {});
  useEffect(() => {
    courseApi.getAllCourses().then(setCourses).catch(() => {});
    questionApi.getAll().then(setQuestions).catch(() => {});
    loadAssignments();
  }, []);

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  async function submit(e) {
    e.preventDefault();
    if (!form.assignmentName || !form.courseId) return show(false, "Name and course are required.");
    setBusy(true);
    try {
      const res = await assignmentApi.addAssignment(form);
      if (picked.length) await assignmentApi.addQuestionsToAssignment(res.assignment._id, picked);
      show(true, `Created "${form.assignmentName}" with ${picked.length} question(s).`);
      setForm({ assignmentName: "", assignmentType: "Homework", courseId: "", dueOn: "" });
      setPicked([]);
      loadAssignments();
    } catch (err) {
      show(false, err.message);
    } finally {
      setBusy(false);
    }
  }

  // Reuse: clone another teacher's assignment into MY course.
  async function reuse(assignmentId) {
    if (!reuseCourse) return show(false, "Pick which of your courses to reuse it into (below the list).");
    try {
      const res = await assignmentApi.reuse(assignmentId, reuseCourse);
      show(true, `Reused "${res.assignment.assignmentName}" into your course.`);
      loadAssignments();
    } catch (err) {
      show(false, err.message);
    }
  }

  return (
    <div className="console-stack">
      <form className="console-card wide" onSubmit={submit}>
        <h3>New assignment</h3>
        <div className="field-row">
          <Field label="Assignment name">
            <input value={form.assignmentName} onChange={(e) => setForm({ ...form, assignmentName: e.target.value })} placeholder="Week 1 — Basics" />
          </Field>
          <Field label="Type">
            <select value={form.assignmentType} onChange={(e) => setForm({ ...form, assignmentType: e.target.value })}>
              <option>Homework</option><option>Quiz</option><option>Project</option><option>Exam</option>
            </select>
          </Field>
        </div>
        <div className="field-row">
          <Field label="Course">
            <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
              <option value="">Select a course…</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.CourseName} ({c.CourseCode})</option>)}
            </select>
          </Field>
          <Field label="Due date">
            <input type="date" value={form.dueOn} onChange={(e) => setForm({ ...form, dueOn: e.target.value })} />
          </Field>
        </div>

        <Field label={`Map questions (${picked.length} selected)`}>
          <div className="question-picker">
            {questions.map((q) => (
              <label key={q._id} className={`pick-row ${picked.includes(q._id) ? "on" : ""}`}>
                <input type="checkbox" checked={picked.includes(q._id)} onChange={() => toggle(q._id)} />
                <span className="pick-text">{q.text}</span>
                <span className="pick-meta">{q.marks}m{q.createdBy?.name ? ` · ${q.createdBy.name}` : ""}</span>
              </label>
            ))}
            {questions.length === 0 && <p className="muted">Add questions first in the Questions tab.</p>}
          </div>
        </Field>

        <button className="console-btn" disabled={busy}>{busy ? "Creating…" : "Create assignment"}</button>
        {flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}
      </form>

      <div className="console-card wide">
        <h3>Reuse an existing assignment <span className="count-pill">{assignments.length}</span></h3>
        <p className="muted hint">
          Any teacher's assignment can be cloned into one of your courses — same questions, your own due date.
        </p>
        <Field label="Reuse into course">
          <select value={reuseCourse} onChange={(e) => setReuseCourse(e.target.value)}>
            <option value="">Select your course…</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.CourseName} ({c.CourseCode})</option>)}
          </select>
        </Field>
        <ul className="console-list">
          {assignments.map((a) => (
            <li key={a._id} className="question-row">
              <div className="q-main">
                <strong>{a.assignmentName}</strong>
                <div className="q-tags">
                  <span className="mini-tag">{a.assignmentType}</span>
                  {a.courseId?.CourseName && <span className="mini-tag">{a.courseId.CourseName}</span>}
                  {a.createdBy?.name && <span className="mini-tag author">by {a.createdBy.name}</span>}
                  <span className="mini-tag">{a.questions?.length || 0} Qs · {a.totalMarks || 0}m</span>
                </div>
              </div>
              <button type="button" className="mini-btn" onClick={() => reuse(a._id)}>Reuse</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Students */
function StudentsTab() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    courseApi.getAllCourses().then(setCourses).catch(() => {});
  }, []);

  return (
    <div>
      <div className="console-card wide" style={{ marginBottom: 20 }}>
        <h3>Manage students</h3>
        <Field label="Course">
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Select a course…</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.CourseName} ({c.CourseCode})</option>)}
          </select>
        </Field>
      </div>
      {/* Keyed by course: switching course remounts with fresh state. */}
      {courseId && <CourseRoster key={courseId} courseId={courseId} />}
      {!courseId && (
        <div className="console-card wide">
          <p className="muted">Pick a course to see and manage its roster.</p>
        </div>
      )}
    </div>
  );
}

function CourseRoster({ courseId }) {
  const [roster, setRoster] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [pickStudent, setPickStudent] = useState("");
  const [version, setVersion] = useState(0);   // bump to reload after enrolling
  const [flash, show] = useFlash();

  useEffect(() => {
    courseApi.getStudents(courseId)
      .then((r) => setRoster(r.students || []))
      .catch(() => setRoster([]));
    userApi.getStudents().then(setAllStudents).catch(() => {});
  }, [courseId, version]);

  async function enroll() {
    if (!pickStudent) return show(false, "Pick a student to enroll.");
    try {
      await courseApi.enrollStudent(courseId, pickStudent);
      show(true, "Student enrolled.");
      setPickStudent("");
      setVersion((v) => v + 1);
    } catch (err) {
      show(false, err.message);
    }
  }

  // Students not already on this course's roster.
  const rosterIds = new Set(roster.map((s) => s._id));
  const available = allStudents.filter((s) => !rosterIds.has(s._id));

  return (
    <div className="console-grid">
      <div className="console-card">
        <h3>Enroll a student</h3>
        <Field label="Student">
          <select value={pickStudent} onChange={(e) => setPickStudent(e.target.value)}>
            <option value="">Select a student…</option>
            {available.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
          </select>
        </Field>
        <button className="console-btn" type="button" onClick={enroll} disabled={!pickStudent}>
          Enroll student
        </button>
        {flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}
      </div>

      <div className="console-card">
        <h3>Roster <span className="count-pill">{roster.length}</span></h3>
        <ul className="console-list">
          {roster.map((s) => (
            <li key={s._id}><strong>{s.name}</strong><span>{s.email}</span></li>
          ))}
          {roster.length === 0 && <li className="muted">No students enrolled yet.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Grading */
function GradingTab() {
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");

  useEffect(() => { assignmentApi.getAllAssignments().then(setAssignments).catch(() => {}); }, []);

  return (
    <div className="console-stack">
      <div className="console-card wide">
        <h3>Review submissions</h3>
        <Field label="Assignment">
          <select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}>
            <option value="">Select an assignment…</option>
            {assignments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.assignmentName} — {a.courseId?.CourseName || "?"}
              </option>
            ))}
          </select>
        </Field>
        {!assignmentId && <p className="muted">Pick an assignment to see its submissions.</p>}
      </div>
      {/* Keyed by assignment: switching remounts with fresh state. */}
      {assignmentId && <SubmissionReview key={assignmentId} assignmentId={assignmentId} />}
    </div>
  );
}

function SubmissionReview({ assignmentId }) {
  const [assignment, setAssignment] = useState(null);   // populated (questions)
  const [subs, setSubs] = useState([]);
  const [open, setOpen] = useState(null);               // submission being graded
  const [marks, setMarks] = useState({});               // questionId → awarded
  const [version, setVersion] = useState(0);            // bump to reload after grading
  const [busy, setBusy] = useState(false);
  const [flash, show] = useFlash();

  useEffect(() => {
    submissionApi.getByAssignment(assignmentId).then(setSubs).catch(() => {});
    assignmentApi.getAssignmentById(assignmentId).then(setAssignment).catch(() => {});
  }, [assignmentId, version]);

  // Question lookup for texts + max marks while grading.
  const qById = new Map((assignment?.questions || []).map((q) => [String(q._id), q]));

  function startGrading(sub) {
    setOpen(sub);
    // Pre-fill with whatever was already awarded (auto-grade or a previous pass).
    const initial = {};
    for (const a of sub.answers) initial[String(a.questionId)] = a.awarded || 0;
    setMarks(initial);
  }

  async function saveGrades() {
    setBusy(true);
    try {
      const perQuestion = Object.entries(marks).map(([questionId, m]) => ({ questionId, marks: Number(m) || 0 }));
      const res = await submissionApi.gradeManual(open._id, perQuestion);
      show(true, `Graded: ${res.marksAwarded}/${res.totalMarks}. Recorded on the student's marks sheet.`);
      setVersion((v) => v + 1);
    } catch (err) {
      show(false, err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="console-card wide">
        <h3>Submissions <span className="count-pill">{subs.length}</span></h3>
        <ul className="console-list">
          {subs.map((s) => (
            <li key={s._id} className="question-row">
              <div className="q-main">
                <strong>{s.studentId?.name || "Student"}</strong>
                <div className="q-tags">
                  <span className={`mini-tag ${s.status === "graded" ? "diff-easy" : "diff-medium"}`}>{s.status}</span>
                  {s.status === "graded" && <span className="mini-tag">{s.marksAwarded}/{assignment?.totalMarks ?? "?"} marks</span>}
                </div>
              </div>
              <button type="button" className="mini-btn" onClick={() => startGrading(s)}>
                {s.status === "graded" ? "Re-grade" : "Grade"}
              </button>
            </li>
          ))}
          {subs.length === 0 && <li className="muted">No submissions yet for this assignment.</li>}
        </ul>
        {!open && flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}
      </div>

      {open && (
        <div className="console-card wide">
          <h3>Grading: {open.studentId?.name}</h3>
          <p className="muted hint">Award marks per question (rubric). Each is capped at the question's maximum.</p>

          {open.answers.map((a) => {
            const q = qById.get(String(a.questionId));
            return (
              <div className="grade-row" key={String(a.questionId)}>
                <div className="grade-q">
                  <strong>{q?.text || "Question"}</strong>
                  <p className="grade-answer">{a.answer || <em className="muted">(no answer)</em>}</p>
                  {q?.correctAnswer && <p className="grade-expected">Expected: {q.correctAnswer}</p>}
                </div>
                <div className="grade-marks">
                  <input
                    type="number"
                    min="0"
                    max={q?.marks ?? 100}
                    value={marks[String(a.questionId)] ?? 0}
                    onChange={(e) => setMarks({ ...marks, [String(a.questionId)]: e.target.value })}
                  />
                  <span className="muted">/ {q?.marks ?? "?"}</span>
                </div>
              </div>
            );
          })}

          <button className="console-btn" type="button" onClick={saveGrades} disabled={busy}>
            {busy ? "Saving…" : "Save grades"}
          </button>
          {flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}
        </div>
      )}
    </>
  );
}

export default Manage;
