
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { attendanceApi, courseApi } from "../services/api";
import { selectUser, selectRole } from "../store/authSlice";

import "../components/AttendanceSection/AttendanceSection.css";

/**
 * AttendanceSection — Dual-purpose page:
 *   🎓 Student View — overview of attendance with per-course progress rings
 *   👨‍🏫 Teacher View — mark / edit attendance for a course's student roster
 *
 * Backend integration (all via attendanceApi in api.js):
 *   • GET  /attendance/getCourseStudents?courseId=   — enrolled students
 *   • GET  /attendance/getAttendanceByCourse?courseId= — all attendance sessions
 *   • POST /attendance/addAttendance                   — create new attendance
 *   • PUT  /attendance/updateAttendance                 — edit (within 5 days)
 *   • GET  /attendance/getStudentAttendance?studentId=  — student's locked records
 */

/* ──────────────────────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────────────────────── */

const COLORS = [
  "#4F46E5", "#7C3AED", "#0EA5E9", "#16A34A",
  "#F59E0B", "#DC2626", "#8B5CF6", "#EC4899",
];

const avatarColors = [
  "#4F46E5", "#7C3AED", "#0EA5E9", "#16A34A",
  "#F59E0B", "#DC2626", "#8B5CF6", "#EC4899",
];

const calcPercentage = (attended, total) =>
  total > 0 ? Math.min(100, Math.round((attended / total) * 100)) : 0;

const getAttendanceStatus = (pct) => {
  if (pct >= 85) return "excellent";
  if (pct >= 75) return "good";
  if (pct >= 65) return "average";
  return "low";
};

const getStatusLabel = (status) => {
  const map = { excellent: "Excellent", good: "Good", average: "Average", low: "Low" };
  return map[status] || "—";
};

const getStatusEmoji = (status) => {
  const map = { excellent: "🏆", good: "✅", average: "📊", low: "⚠️" };
  return map[status] || "—";
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const formatDate = (str) => {
  if (!str) return "";
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
};

const getAvatarColor = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ──────────────────────────────────────────────────────────────────────────────
   SUBJECT CARD — student attendance per course (progress ring)
   ────────────────────────────────────────────────────────────────────────────── */

function SubjectCard({ subject }) {
  const { name, code, attended, total, color } = subject;
  const percentage = calcPercentage(attended, total);
  const status = getAttendanceStatus(percentage);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="att-subject-card" style={{ "--card-accent": color }}>
      <div className="att-ring-wrapper">
        <svg
          width="112"
          height="112"
          viewBox="0 0 112 112"
          role="img"
          aria-label={`${percentage}% attendance`}
        >
          <circle
            cx="56" cy="56" r={radius}
            fill="none" stroke="#EEF0F7" strokeWidth="8"
          />
          <circle
            cx="56" cy="56" r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 56 56)"
            className="att-progress-ring"
          />
        </svg>
        <div className="att-ring-text">
          <span className="att-pct">{percentage}%</span>
          <span className="att-ring-label">Attended</span>
        </div>
      </div>
      <div className="att-card-body">
        {code && <span className="att-code" style={{ color }}>{code}</span>}
        <h4 className="att-subject-name">{name}</h4>
        <div className="att-meta">
          <div className="att-meta-item">
            <span className="att-meta-label">Attended</span>
            <span className="att-meta-value">{attended}</span>
          </div>
          <div className="att-meta-item">
            <span className="att-meta-label">Total</span>
            <span className="att-meta-value">{total}</span>
          </div>
        </div>
        <span className={`att-badge att-badge--${status}`}>
          {getStatusEmoji(status)} {getStatusLabel(status)}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   STUDENT VIEW — reads locked attendance records from backend
   ────────────────────────────────────────────────────────────────────────────── */

function StudentAttendanceView() {
  const user = useSelector(selectUser);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await attendanceApi.getStudentAttendance(user._id);
        const records = res.attendance || [];

        // Group records by course name to get per-subject stats
        const grouped = {};
        records.forEach((item) => {
          if (!grouped[item.courseName]) {
            grouped[item.courseName] = {
              name: item.courseName,
              code: "",
              attended: 0,
              total: 0,
              color: COLORS[Object.keys(grouped).length % COLORS.length],
            };
          }
          grouped[item.courseName].total += 1;
          if (item.status === "Present") {
            grouped[item.courseName].attended += 1;
          }
        });
        setSubjects(Object.values(grouped));
      } catch (err) {
        console.error("Failed to load student attendance:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user?._id) loadAttendance();
  }, [user]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <section className="att-section">
        <div className="att-loading">Loading your attendance…</div>
      </section>
    );
  }

  const overallAttended = subjects.reduce((s, sub) => s + sub.attended, 0);
  const overallTotal = subjects.reduce((s, sub) => s + sub.total, 0);
  const overallPct = calcPercentage(overallAttended, overallTotal);
  const overallStatus = getAttendanceStatus(overallPct);

  /* ── Empty state (no attendance marked yet) ── */
  if (subjects.length === 0) {
    return (
      <section className="att-section">
        <div className="att-empty">
          <div className="att-empty-icon">📊</div>
          <p>
            No attendance records available yet. Your attendance will appear here
            once your teachers mark it and the 5‑day editing window closes.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="att-section">
      {/* ── Header with overall badge ── */}
      <div className="att-header">
        <div className="att-header-left">
          <h2 className="att-title">
            <span className="att-title-icon">📊</span>
            Attendance Overview
          </h2>
          <p className="att-subtitle">
            Track your attendance across all enrolled subjects this semester.
          </p>
        </div>
        <div className="att-header-right">
          <div className={`att-overall-badge att-overall-badge--${overallStatus}`}>
            <span className="att-overall-pct">{overallPct}%</span>
            <span className="att-overall-label">{getStatusLabel(overallStatus)}</span>
          </div>
        </div>
      </div>

      {/* ── Overall summary bar ── */}
      <div className="att-overall-bar">
        <div className="att-overall-bar-stats">
          <div className="att-overall-bar-item">
            <strong>{overallAttended}</strong>
            <span className="att-bar-label">Attended</span>
          </div>
          <div className="att-overall-bar-divider" />
          <div className="att-overall-bar-item">
            <strong>{overallTotal}</strong>
            <span className="att-bar-label">Total</span>
          </div>
          <div className="att-overall-bar-divider" />
          <div className="att-overall-bar-item">
            <strong className={`att-bar-status att-bar-status--${overallStatus}`}>
              {getStatusEmoji(overallStatus)} {getStatusLabel(overallStatus)}
            </strong>
          </div>
        </div>
        <div className="att-overall-bar-track">
          <div
            className={`att-overall-bar-fill att-overall-bar-fill--${overallStatus}`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* ── Per-subject breakdown ── */}
      <h3 className="att-section-subtitle">Per‑Subject Breakdown</h3>
      <div className="att-cards-grid">
        {subjects.map((subject, i) => (
          <SubjectCard key={i} subject={subject} />
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   TEACHER VIEW — Mark / Edit Attendance for a Course
   ────────────────────────────────────────────────────────────────────────────── */

function TeacherAttendanceView() {
  const user = useSelector(selectUser);

  /* ── State ── */
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(todayStr());
  const [attendance, setAttendance] = useState({});           // studentId → "Present" | "Absent"
  const [existingAttendanceId, setExistingAttendanceId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  /* ── 1. Load courses taught by this teacher ── */
  useEffect(() => {
    async function loadCourses() {
      try {
        const courses = await courseApi.getAllCourses();
        setTeacherCourses(courses || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Could not load your courses.");
      }
    }
    if (user?._id) loadCourses();
  }, [user]);

  /* ── 2. When course or date changes → load students + check existing attendance ── */
  useEffect(() => {
    if (!selectedCourseId) return;

    async function loadRoster() {
      setLoadingStudents(true);
      setError(null);
      setExistingAttendanceId(null);
      setIsLocked(false);
      setAttendance({});
      setSubmitted(false);

      try {
        // 2a. Fetch enrolled students for this course
        const studentRes = await attendanceApi.getCourseStudents(selectedCourseId);
        setStudents(studentRes.students || []);

        // 2b. Check if attendance already exists for this course on this date
        const attRes = await attendanceApi.getAttendanceByCourse(selectedCourseId);
        const sessions = attRes.attendance || [];
        const match = sessions.find((s) => {
          const sessionDate = new Date(s.attendanceDate).toISOString().slice(0, 10);
          return sessionDate === attendanceDate;
        });

        if (match) {
          setExistingAttendanceId(match._id);

          // Pre‑fill the attendance state from the existing record
          const prefill = {};
          match.attendanceRecords.forEach((r) => {
            const sid = r.studentId?._id || r.studentId;
            prefill[sid] = r.status; // "Present" or "Absent"
          });
          setAttendance(prefill);

          // Check whether the 5‑day editing window has expired
          if (new Date() > new Date(match.editableUntil)) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error("Failed to load roster:", err);
        setError("Could not load student roster.");
      } finally {
        setLoadingStudents(false);
      }
    }

    loadRoster();
  }, [selectedCourseId, attendanceDate]);

  /* ── Derived values ── */
  const selectedCourse = teacherCourses.find((c) => c._id === selectedCourseId);
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter((v) => v === "Present").length;
  const absentCount = Object.values(attendance).filter((v) => v === "Absent").length;
  const markedCount = presentCount + absentCount;

  /* ── Toggle a single student ── */
  const toggleStudent = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  /* ── Mark all students with one status ── */
  const markAll = (status) => {
    const all = {};
    students.forEach((s) => {
      all[s._id] = status;
    });
    setAttendance(all);
  };

  /* ── Submit: create new OR update existing ── */
  const handleSubmit = async () => {
    if (!selectedCourseId || markedCount === 0) return;

    setSubmitting(true);
    setError(null);

    const attendanceRecords = students
      .filter((s) => attendance[s._id])
      .map((s) => ({
        studentId: s._id,
        status: attendance[s._id],
      }));

    try {
      if (existingAttendanceId) {
        await attendanceApi.updateAttendance({
          attendanceId: existingAttendanceId,
          attendanceRecords,
        });
      } else {
        await attendanceApi.addAttendance({
          courseId: selectedCourseId,
          teacherId: user._id,
          attendanceDate,
          attendanceRecords,
        });
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to save attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ── */
  return (
    <section className="att-section">
      {/* ── Header ── */}
      <div className="att-header">
        <div className="att-header-left">
          <h2 className="att-title">
            <span className="att-title-icon">📋</span>
            Mark Attendance
          </h2>
          <p className="att-subtitle">
            Record attendance for your course. Select a course and date, then mark
            each student as present or absent. You can edit within 5 days.
          </p>
        </div>
      </div>

      {/* ── Controls: Course + Date ── */}
      <div className="att-teacher-controls">
        <div className="att-control-group">
          <label className="att-control-label">
            <span className="att-control-label-icon">📚</span>
            Course
          </label>
          <select
            className="att-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">Select a course…</option>
            {teacherCourses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.CourseCode} — {c.CourseName}
              </option>
            ))}
          </select>
        </div>

        <div className="att-control-group">
          <label className="att-control-label">
            <span className="att-control-label-icon">📅</span>
            Date
          </label>
          <input
            type="date"
            className="att-date-input"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="att-error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Locked banner ── */}
      {isLocked && (
        <div className="att-locked-banner">
          <span>🔒</span>
          <span>
            This attendance record is locked — the 2‑day editing window has
            expired. It is now visible on the student portal.
          </span>
        </div>
      )}

      {/* ── Empty state: no course selected ── */}
      {!selectedCourseId && (
        <div className="att-empty">
          <div className="att-empty-icon">📋</div>
          <p>Select a course above to start marking attendance.</p>
        </div>
      )}

      {/* ── Loading students ── */}
      {selectedCourseId && loadingStudents && (
        <div className="att-loading" style={{ padding: "32px 20px" }}>
          Loading roster…
        </div>
      )}

      {/* ── Main roster area ── */}
      {selectedCourseId && !loadingStudents && (
        <>
          {/* ── Summary / Quick Actions ── */}
          <div className="att-teacher-summary">
            <div className="att-teacher-summary-stats">
              <span className="att-teacher-stat">
                <span className="att-teacher-stat-value att-present-count">
                  {presentCount}
                </span>
                <span className="att-teacher-stat-label">Present</span>
              </span>
              <span className="att-teacher-stat-divider" />
              <span className="att-teacher-stat">
                <span className="att-teacher-stat-value att-absent-count">
                  {absentCount}
                </span>
                <span className="att-teacher-stat-label">Absent</span>
              </span>
              <span className="att-teacher-stat-divider" />
              <span className="att-teacher-stat">
                <span className="att-teacher-stat-value">
                  {totalStudents - markedCount}
                </span>
                <span className="att-teacher-stat-label">Unmarked</span>
              </span>
              {isLocked && (
                <>
                  <span className="att-teacher-stat-divider" />
                  <span className="att-teacher-stat">
                    <span className="att-teacher-stat-value" style={{ color: "#6B7280", fontSize: 14 }}>
                      🔒
                    </span>
                    <span className="att-teacher-stat-label">Locked</span>
                  </span>
                </>
              )}
            </div>
            <div className="att-teacher-quick-actions">
              <button
                className="att-quick-btn att-quick-present"
                onClick={() => markAll("Present")}
                disabled={isLocked}
              >
                ✓ Mark All Present
              </button>
              <button
                className="att-quick-btn att-quick-absent"
                onClick={() => markAll("Absent")}
                disabled={isLocked}
              >
                ✗ Mark All Absent
              </button>
              <button
                className={`att-submit-btn ${markedCount === 0 || isLocked ? "disabled" : ""}`}
                onClick={handleSubmit}
                disabled={markedCount === 0 || submitting || isLocked}
              >
                {submitting ? (
                  <>
                    <span className="att-spinner" /> Saving…
                  </>
                ) : submitted ? (
                  "✓ Recorded"
                ) : existingAttendanceId ? (
                  `Update Attendance (${markedCount}/${totalStudents})`
                ) : (
                  `Submit Attendance (${markedCount}/${totalStudents})`
                )}
              </button>
            </div>
          </div>

          {/* ── Success banner ── */}
          {submitted && (
            <div className="att-success-banner">
              <span className="att-success-icon">✓</span>
              <span>
                Attendance {existingAttendanceId ? "updated" : "recorded"} for{" "}
                <strong>
                  {selectedCourse?.CourseCode} — {selectedCourse?.CourseName}
                </strong>{" "}
                on {formatDate(attendanceDate)} —{" "}
                <strong>{presentCount} present</strong>, {absentCount} absent
              </span>
            </div>
          )}

          {/* ── Empty roster ── */}
          {students.length === 0 && (
            <div className="att-empty">
              <div className="att-empty-icon">👥</div>
              <p>
                No students are enrolled in this course yet. Enroll students first
                to mark attendance.
              </p>
            </div>
          )}

          {/* ── Student Roster ── */}
          {students.length > 0 && (
            <div className={`att-roster-card ${isLocked ? "att-roster-card--locked" : ""}`}>
              <div className="att-roster-header">
                <h3 className="att-roster-title">
                  {selectedCourse?.CourseCode} — {selectedCourse?.CourseName}
                </h3>
                <span className="att-roster-semester">
                  {selectedCourse?.semester || (
                    existingAttendanceId
                      ? isLocked ? "🔒 Locked" : "✏️ Editable"
                      : "New Entry"
                  )}
                </span>
              </div>
              <div className="att-roster-list">
                {students.map((student) => {
                  const status = attendance[student._id] || null;
                  const avatarColor = getAvatarColor(student._id);
                  return (
                    <div
                      key={student._id}
                      className={`att-student-row ${status ? `att-student-row--${status.toLowerCase()}` : ""}`}
                    >
                      <div className="att-student-info">
                        <span
                          className="att-student-avatar"
                          style={{
                            background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)`,
                          }}
                          title={student.name}
                        >
                          {getInitials(student.name)}
                        </span>
                        <span className="att-student-roll">
                          #{student._id.slice(-5).toUpperCase()}
                        </span>
                        <div className="att-student-name-group">
                          <span className="att-student-name">{student.name}</span>
                          <span className="att-student-email">{student.email}</span>
                        </div>
                      </div>
                      <div className="att-student-actions">
                        <button
                          className={`att-toggle-btn att-toggle-present ${status === "Present" ? "active" : ""}`}
                          onClick={() => toggleStudent(student._id, "Present")}
                          disabled={isLocked}
                        >
                          ✓ Present
                        </button>
                        <button
                          className={`att-toggle-btn att-toggle-absent ${status === "Absent" ? "active" : ""}`}
                          onClick={() => toggleStudent(student._id, "Absent")}
                          disabled={isLocked}
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT — picks the right view based on role
   ────────────────────────────────────────────────────────────────────────────── */

export default function AttendanceSection() {
  const role = useSelector(selectRole);
  const isTeacher = role === "teacher" || role === "superadmin";

  return isTeacher ? <TeacherAttendanceView /> : <StudentAttendanceView />;
}

