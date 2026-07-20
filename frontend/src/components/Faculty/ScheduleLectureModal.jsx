import { useState } from "react";

const COURSES = ["Data Structures", "DBMS", "Computer Networks", "Operating Systems", "Discrete Mathematics", "Algorithms", "Computer Graphics", "Python Programming"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ["A", "B", "C"];
const ROOMS = ["A101", "A103", "A203", "B204", "C101", "Lab 1", "Lab 2", "Lab 3", "Auditorium", "Hall A"];
const TYPES = ["Theory", "Lab", "Tutorial"];

function ScheduleLectureModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ course: "", semester: "", section: "", date: "", start: "", end: "", room: "", type: "Theory", faculty: "Prof. Faculty", notes: "" });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.course) errs.course = "Required";
    if (!form.semester) errs.semester = "Required";
    if (!form.section) errs.section = "Required";
    if (!form.date) errs.date = "Required";
    if (!form.start) errs.start = "Required";
    if (!form.end) errs.end = "Required";
    if (!form.room) errs.room = "Required";
    if (form.start && form.end && form.start >= form.end) errs.end = "Must be after start";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id: "new_" + Date.now(),
      title: form.course,
      faculty: form.faculty,
      date: form.date,
      start: form.start,
      end: form.end,
      room: form.room,
      semester: parseInt(form.semester),
      section: form.section,
      type: form.type,
      category: form.type === "Lab" ? "lab" : form.type === "Tutorial" ? "tutorial" : "lecture",
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Schedule Lecture</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-grid">
            <div className="modal-field">
              <label className="modal-label">Course *</label>
              <select name="course" value={form.course} onChange={handleChange} className={`modal-input ${errors.course ? "modal-field--error" : ""}`}>
                <option value="">Select course</option>
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.course && <span className="modal-error">{errors.course}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Semester *</label>
              <select name="semester" value={form.semester} onChange={handleChange} className={`modal-input ${errors.semester ? "modal-field--error" : ""}`}>
                <option value="">Select semester</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
              {errors.semester && <span className="modal-error">{errors.semester}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Section *</label>
              <select name="section" value={form.section} onChange={handleChange} className={`modal-input ${errors.section ? "modal-field--error" : ""}`}>
                <option value="">Select section</option>
                {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
              </select>
              {errors.section && <span className="modal-error">{errors.section}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={`modal-input ${errors.date ? "modal-field--error" : ""}`} />
              {errors.date && <span className="modal-error">{errors.date}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Start Time *</label>
              <input type="time" name="start" value={form.start} onChange={handleChange} className={`modal-input ${errors.start ? "modal-field--error" : ""}`} />
              {errors.start && <span className="modal-error">{errors.start}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">End Time *</label>
              <input type="time" name="end" value={form.end} onChange={handleChange} className={`modal-input ${errors.end ? "modal-field--error" : ""}`} />
              {errors.end && <span className="modal-error">{errors.end}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Classroom *</label>
              <select name="room" value={form.room} onChange={handleChange} className={`modal-input ${errors.room ? "modal-field--error" : ""}`}>
                <option value="">Select room</option>
                {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.room && <span className="modal-error">{errors.room}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Lecture Type</label>
              <div className="modal-radio-group">
                {TYPES.map((t) => (
                  <label key={t} className="modal-radio">
                    <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} />
                    <span className={`modal-radio-label ${form.type === t ? "active" : ""}`}>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              Schedule Lecture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleLectureModal;
