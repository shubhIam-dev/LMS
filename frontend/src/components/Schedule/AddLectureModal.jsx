import { useState } from "react";

const COURSES = [
  "Data Structures",
  "DBMS",
  "Computer Networks",
  "Operating Systems",
  "Discrete Mathematics",
  "Algorithms",
  "Computer Graphics",
  "Python Programming",
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ["A", "B", "C"];
const ROOMS = ["A101", "A103", "A203", "B204", "C101", "Lab 1", "Lab 2", "Lab 3", "Auditorium", "Hall A"];
const LECTURE_TYPES = ["Theory", "Lab", "Tutorial"];

function AddLectureModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    course: "",
    semester: "",
    section: "",
    date: "",
    startTime: "",
    endTime: "",
    room: "",
    type: "Theory",
    notes: "",
    faculty: "Prof. Faculty",
    students: 0,
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.course) newErrors.course = "Course is required";
    if (!formData.semester) newErrors.semester = "Semester is required";
    if (!formData.section) newErrors.section = "Section is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.room) newErrors.room = "Classroom is required";
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newLecture = {
      id: Date.now(),
      course: formData.course,
      faculty: formData.faculty,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      room: formData.room,
      semester: parseInt(formData.semester, 10),
      section: formData.section,
      type: formData.type,
      students: parseInt(formData.students, 10) || 0,
    };

    onSave(newLecture);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Schedule Lecture</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-grid">
            {/* Course */}
            <div className="modal-field">
              <label className="modal-label">Course *</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={`modal-select ${errors.course ? "modal-field--error" : ""}`}
              >
                <option value="">Select course</option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.course && <span className="modal-error">{errors.course}</span>}
            </div>

            {/* Semester */}
            <div className="modal-field">
              <label className="modal-label">Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={`modal-select ${errors.semester ? "modal-field--error" : ""}`}
              >
                <option value="">Select semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
              {errors.semester && <span className="modal-error">{errors.semester}</span>}
            </div>

            {/* Section */}
            <div className="modal-field">
              <label className="modal-label">Section *</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className={`modal-select ${errors.section ? "modal-field--error" : ""}`}
              >
                <option value="">Select section</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
              {errors.section && <span className="modal-error">{errors.section}</span>}
            </div>

            {/* Date */}
            <div className="modal-field">
              <label className="modal-label">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`modal-input ${errors.date ? "modal-field--error" : ""}`}
              />
              {errors.date && <span className="modal-error">{errors.date}</span>}
            </div>

            {/* Start Time */}
            <div className="modal-field">
              <label className="modal-label">Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`modal-input ${errors.startTime ? "modal-field--error" : ""}`}
              />
              {errors.startTime && <span className="modal-error">{errors.startTime}</span>}
            </div>

            {/* End Time */}
            <div className="modal-field">
              <label className="modal-label">End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`modal-input ${errors.endTime ? "modal-field--error" : ""}`}
              />
              {errors.endTime && <span className="modal-error">{errors.endTime}</span>}
            </div>

            {/* Classroom */}
            <div className="modal-field">
              <label className="modal-label">Classroom *</label>
              <select
                name="room"
                value={formData.room}
                onChange={handleChange}
                className={`modal-select ${errors.room ? "modal-field--error" : ""}`}
              >
                <option value="">Select room</option>
                {ROOMS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.room && <span className="modal-error">{errors.room}</span>}
            </div>

            {/* Lecture Type */}
            <div className="modal-field">
              <label className="modal-label">Lecture Type</label>
              <div className="modal-radio-group">
                {LECTURE_TYPES.map((t) => (
                  <label key={t} className="modal-radio">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={formData.type === t}
                      onChange={handleChange}
                    />
                    <span className={`modal-radio-label ${formData.type === t ? "active" : ""}`}>
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Students */}
            <div className="modal-field">
              <label className="modal-label">Students</label>
              <input
                type="number"
                name="students"
                value={formData.students}
                onChange={handleChange}
                min="0"
                className="modal-input"
                placeholder="Number of students"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="modal-field modal-field--full">
            <label className="modal-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="modal-textarea"
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
              Schedule Lecture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLectureModal;
