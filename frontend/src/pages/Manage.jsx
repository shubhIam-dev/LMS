// Manage — the Teacher Console. Staff-only (teacher / superadmin).
// Three tabs, each a small create-form + live list:
//   1. Courses     — create a course
//   2. Questions   — add a question to the reusable bank
//   3. Assignments — create an assignment for a course and map questions to it
//
// Every call goes through services/api.js, which attaches the JWT — the backend
// enforces that only teachers/superadmins can hit these endpoints.

import { useState, useEffect } from "react";
import { courseApi, questionApi, assignmentApi } from "../services/api";

function Manage() {
  const [tab, setTab] = useState("courses");
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Teacher Console</h1>
        <p>Create courses, build the question bank, and set up assignments.</p>
      </div>

      <div className="console-tabs">
        {[
          ["courses", "Courses"],
          ["questions", "Questions"],
          ["assignments", "Assignments"],
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
    </div>
  );
}

// Small helper for the green/red status line under each form.
function useFlash() {
  const [flash, setFlash] = useState(null); // { ok: bool, msg: string }
  const show = (ok, msg) => {
    setFlash({ ok, msg });
    setTimeout(() => setFlash(null), 4000);
  };
  return [flash, show];
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
  const [form, setForm] = useState({ text: "", questionType: "short", correctAnswer: "", marks: 1, topic: "" });
  const [busy, setBusy] = useState(false);
  const [flash, show] = useFlash();

  const load = () => questionApi.getAll().then(setQuestions).catch(() => {});
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.text) return show(false, "Question text is required.");
    setBusy(true);
    try {
      await questionApi.add({ ...form, marks: Number(form.marks) });
      show(true, "Question added to the bank.");
      setForm({ text: "", questionType: "short", correctAnswer: "", marks: 1, topic: "" });
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
        <button className="console-btn" disabled={busy}>{busy ? "Adding…" : "Add question"}</button>
        {flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}
      </form>

      <div className="console-card">
        <h3>Question bank <span className="count-pill">{questions.length}</span></h3>
        <ul className="console-list">
          {questions.map((q) => (
            <li key={q._id}><strong>{q.text}</strong><span>{q.questionType} · {q.marks}m</span></li>
          ))}
          {questions.length === 0 && <li className="muted">No questions yet.</li>}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Assignments */
function AssignmentsTab() {
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ assignmentName: "", assignmentType: "Homework", courseId: "", dueOn: "" });
  const [picked, setPicked] = useState([]); // question ids
  const [busy, setBusy] = useState(false);
  const [flash, show] = useFlash();

  useEffect(() => {
    courseApi.getAllCourses().then(setCourses).catch(() => {});
    questionApi.getAll().then(setQuestions).catch(() => {});
  }, []);

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  async function submit(e) {
    e.preventDefault();
    if (!form.assignmentName || !form.courseId) return show(false, "Name and course are required.");
    setBusy(true);
    try {
      // 1) create the assignment (mapped to the course)
      const res = await assignmentApi.addAssignment(form);
      const assignmentId = res.assignment._id;
      // 2) map the picked questions to it
      if (picked.length) await assignmentApi.addQuestionsToAssignment(assignmentId, picked);
      show(true, `Created "${form.assignmentName}" with ${picked.length} question(s).`);
      setForm({ assignmentName: "", assignmentType: "Homework", courseId: "", dueOn: "" });
      setPicked([]);
    } catch (err) {
      show(false, err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
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
              <span className="pick-meta">{q.marks}m</span>
            </label>
          ))}
          {questions.length === 0 && <p className="muted">Add questions first in the Questions tab.</p>}
        </div>
      </Field>

      <button className="console-btn" disabled={busy}>{busy ? "Creating…" : "Create assignment"}</button>
      {flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default Manage;
