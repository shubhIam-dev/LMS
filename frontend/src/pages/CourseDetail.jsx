// CourseDetail — a dedicated page for one course.
// Shows: description, instructor, assignments, notes, announcements,
// enrolled students, and (for students) self-enroll + progress.
//
// Route: /courses/:id   (any signed-in user)

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { courseApi, assignmentApi, notesApi, announcementApi } from "../services/api";
import { selectUser, selectRole } from "../store/authSlice";

function CourseDetail() {
  const { id } = useParams();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const isStudent = role === "student";

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Teacher: add note / announcement form
  const [noteForm, setNoteForm] = useState({ title: "", description: "", fileUrl: "" });
  const [announceForm, setAnnounceForm] = useState({ text: "" });
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const showFlash = (ok, msg) => {
    setFlash({ ok, msg });
    setTimeout(() => setFlash(null), 4000);
  };

  async function loadAll() {
    try {
      const [c, a, n, ann] = await Promise.all([
        courseApi.getCourseById(id),
        assignmentApi.getByCourse(id).catch(() => []),
        notesApi.getByCourse(id).catch(() => []),
        announcementApi.getByCourse(id).catch(() => []),
      ]);
      setCourse(c);
      setAssignments(Array.isArray(a) ? a : []);
      setNotes(Array.isArray(n) ? n : []);
      setAnnouncements(Array.isArray(ann) ? ann : []);
    } catch {
      setError("Could not load course details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [id]);

  // Load progress if student is enrolled
  useEffect(() => {
    if (isStudent && course && user?._id) {
      courseApi.getProgress(id, user._id)
        .then(setProgress)
        .catch(() => setProgress(null));
    }
  }, [isStudent, course, user?._id, id]);

  // ── Self-enroll ──
  async function handleSelfEnroll() {
    try {
      await courseApi.selfEnroll(id);
      showFlash(true, "Enrolled successfully!");
      const c = await courseApi.getCourseById(id);
      setCourse(c);
    } catch (err) {
      showFlash(false, err.message);
    }
  }

  // ── Add note ──
  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteForm.title) return showFlash(false, "Title is required.");
    setBusy(true);
    try {
      await notesApi.add({ ...noteForm, courseId: id });
      showFlash(true, "Note added.");
      setNoteForm({ title: "", description: "", fileUrl: "" });
      const n = await notesApi.getByCourse(id);
      setNotes(n);
    } catch (err) {
      showFlash(false, err.message);
    } finally {
      setBusy(false);
    }
  }

  // ── Delete note ──
  async function handleDeleteNote(noteId) {
    if (!window.confirm("Delete this note?")) return;
    try {
      await notesApi.delete(noteId);
      showFlash(true, "Note deleted.");
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      showFlash(false, err.message);
    }
  }

  // ── Add announcement ──
  async function handleAddAnnouncement(e) {
    e.preventDefault();
    if (!announceForm.text) return showFlash(false, "Announcement text is required.");
    setBusy(true);
    try {
      await announcementApi.add({ text: announceForm.text, courseId: id });
      showFlash(true, "Announcement posted.");
      setAnnounceForm({ text: "" });
      const ann = await announcementApi.getByCourse(id);
      setAnnouncements(ann);
    } catch (err) {
      showFlash(false, err.message);
    } finally {
      setBusy(false);
    }
  }

  // ── Delete announcement ──
  async function handleDeleteAnnouncement(annId) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await announcementApi.delete(annId);
      showFlash(true, "Announcement deleted.");
      setAnnouncements((prev) => prev.filter((a) => a._id !== annId));
    } catch (err) {
      showFlash(false, err.message);
    }
  }

  if (loading) return <div className="page-content"><div className="loading-spinner">Loading course…</div></div>;
  if (!course) return <div className="page-content"><div className="empty-state"><h3>Not found</h3><p>{error || "This course doesn't exist."}</p></div></div>;

  const isEnrolled = user?._id && (course.enrolledStudents || []).some((s) => String(s._id) === String(user._id));

  return (
    <div className="page-content">
      <p className="back-link"><Link to="/courses">← All courses</Link></p>

      {/* ── Course Info ── */}
      <div className="course-detail-header">
        <div>
          <h1>{course.CourseName}</h1>
          <p className="course-detail-meta">
            <span className="course-code-badge">{course.CourseCode}</span>
            {course.credits && <span> · {course.credits} credits</span>}
            {course.semester && <span> · {course.semester}</span>}
            {course.instructor?.name && <span> · Instructor: {course.instructor.name}</span>}
            {course.enrolledStudents && <span> · {course.enrolledStudents.length} enrolled</span>}
          </p>
          {course.description && <p className="course-detail-desc">{course.description}</p>}
        </div>

        {/* Self-enroll button for students */}
        {isStudent && !isEnrolled && (
          <button className="console-btn" onClick={handleSelfEnroll} style={{ alignSelf: "flex-start" }}>
            Enroll in this course
          </button>
        )}
        {isStudent && isEnrolled && (
          <span className="mini-tag diff-easy" style={{ alignSelf: "flex-start", fontSize: 14 }}>✅ Enrolled</span>
        )}
      </div>

      {flash && <p className={`console-flash ${flash.ok ? "ok" : "err"}`}>{flash.msg}</p>}

      {/* ── Progress (student view) ── */}
      {isStudent && progress && (
        <div className="console-card wide">
          <h3>Your progress</h3>
          <div className="progress-stats">
            <div className="stat-box"><span className="stat-num">{progress.submitted}/{progress.totalAssignments}</span><span className="stat-label">Assignments done</span></div>
            <div className="stat-box"><span className="stat-num">{progress.graded}</span><span className="stat-label">Graded</span></div>
            <div className="stat-box"><span className="stat-num">{progress.earnedMarks}/{progress.totalMarks}</span><span className="stat-label">Marks earned</span></div>
          </div>
        </div>
      )}

      {/* ── Assignments ── */}
      <div className="console-card wide">
        <h3>Assignments <span className="count-pill">{assignments.length}</span></h3>
        {assignments.length === 0 ? (
          <p className="muted">No assignments for this course yet.</p>
        ) : (
          <ul className="console-list">
            {assignments.map((a) => (
              <li key={a._id} className="question-row">
                <div className="q-main">
                  <strong>{a.assignmentName}</strong>
                  <div className="q-tags">
                    <span className="mini-tag">{a.assignmentType}</span>
                    <span className="mini-tag">{a.questions?.length || 0} Qs · {a.totalMarks || 0}m</span>
                    {a.dueOn && <span className="mini-tag">due {new Date(a.dueOn).toLocaleDateString()}</span>}
                  </div>
                </div>
                <Link to={`/assignments/${a._id}`} className="mini-btn">Open</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Announcements ── */}
      <div className="console-card wide">
        <h3>Announcements <span className="count-pill">{announcements.length}</span></h3>

        {/* Teacher can add announcement */}
        {!isStudent && (
          <form onSubmit={handleAddAnnouncement} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--r, 8px)", border: "1px solid var(--line, #E5E7EB)" }}
                placeholder="Post an announcement…"
                value={announceForm.text}
                onChange={(e) => setAnnounceForm({ text: e.target.value })}
              />
              <button className="console-btn" disabled={busy || !announceForm.text} style={{ padding: "8px 16px", fontSize: 13 }}>Post</button>
            </div>
          </form>
        )}

        {announcements.length === 0 ? (
          <p className="muted">No announcements yet.</p>
        ) : (
          <ul className="console-list">
            {announcements.map((ann) => (
              <li key={ann._id} className="question-row">
                <div className="q-main">
                  <strong>{ann.text}</strong>
                  <div className="q-tags">
                    {ann.createdBy?.name && <span className="mini-tag author">by {ann.createdBy.name}</span>}
                    <span className="mini-tag">{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {!isStudent && (
                  <button type="button" className="mini-btn" style={{ color: "var(--danger, #DC2626)" }} onClick={() => handleDeleteAnnouncement(ann._id)}>🗑️</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Notes / Materials ── */}
      <div className="console-card wide">
        <h3>Notes & Materials <span className="count-pill">{notes.length}</span></h3>

        {/* Teacher can add note */}
        {!isStudent && (
          <form onSubmit={handleAddNote} style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--r, 8px)", border: "1px solid var(--line, #E5E7EB)" }}
                placeholder="Note title…"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              />
              <input
                style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--r, 8px)", border: "1px solid var(--line, #E5E7EB)" }}
                placeholder="File URL (optional)…"
                value={noteForm.fileUrl}
                onChange={(e) => setNoteForm({ ...noteForm, fileUrl: e.target.value })}
              />
            </div>
            <textarea
              rows={2}
              style={{ padding: "8px 12px", borderRadius: "var(--r, 8px)", border: "1px solid var(--line, #E5E7EB)" }}
              placeholder="Description (optional)…"
              value={noteForm.description}
              onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
            />
            <button className="console-btn" disabled={busy || !noteForm.title} style={{ alignSelf: "flex-start", padding: "8px 16px", fontSize: 13 }}>Add note</button>
          </form>
        )}

        {notes.length === 0 ? (
          <p className="muted">No notes or materials yet.</p>
        ) : (
          <ul className="console-list">
            {notes.map((note) => (
              <li key={note._id} className="question-row">
                <div className="q-main">
                  <strong>{note.title}</strong>
                  <div className="q-tags">
                    {note.description && <span className="mini-tag">{note.description}</span>}
                    {note.uploadedBy?.name && <span className="mini-tag author">by {note.uploadedBy.name}</span>}
                    <span className="mini-tag">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {note.fileUrl && (
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="mini-btn">Open</a>
                  )}
                  {!isStudent && (
                    <button type="button" className="mini-btn" style={{ color: "var(--danger, #DC2626)" }} onClick={() => handleDeleteNote(note._id)}>🗑️</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;
