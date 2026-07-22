// StudentScoreForm — Faculty Score Editing Form
//
// This is the detailed form that opens when a faculty member clicks "Edit"
// on a student row. It shows:
//   • Student Information (name, roll number, course)
//   • All Assessment Components (Contest 1, Contest 2, Mid Semester, etc.)
//   • Attendance fields
//   • Auto-calculated GPA, Overall Percentage, and Grade
//
// On save, it either creates a new score record (if none existed) or updates
// the existing one. The student immediately sees the updated marks.

import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { facultyScoreApi } from "../../services/facultyScoreApi";
import "./FacultyScore.css";

// ── Default assessment components for a typical course ──────────
// Faculty can modify these fields in the form. The component names
// follow a standard university pattern.
const DEFAULT_COMPONENTS = [
  { componentName: "Contest 1",         marksObtained: 0, totalMarks: 0, currentWeightage: 10, finalWeightage: 10 },
  { componentName: "Contest 2",         marksObtained: 0, totalMarks: 0, currentWeightage: 10, finalWeightage: 10 },
  { componentName: "Mid Semester",      marksObtained: 0, totalMarks: 0, currentWeightage: 25, finalWeightage: 25 },
  { componentName: "Assignment",        marksObtained: 0, totalMarks: 0, currentWeightage: 10, finalWeightage: 10 },
  { componentName: "Quiz",              marksObtained: 0, totalMarks: 0, currentWeightage: 10, finalWeightage: 10 },
  { componentName: "End Semester",      marksObtained: 0, totalMarks: 0, currentWeightage: 35, finalWeightage: 35 },
];

function StudentScoreForm() {
  // ── Route params & state ──────────────────────────────────────
  const { courseId, studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from ScoreManagement via React Router state
  const student = location.state?.student || {};
  const course = location.state?.course || {};
  const existingScoreId = location.state?.scoreId || null;

  // ── Form state ────────────────────────────────────────────────
  const [components, setComponents] = useState(DEFAULT_COMPONENTS);
  const [attendance, setAttendance] = useState({
    classesAttended: 0,
    totalClasses: 0,
    requiredCutoff: 75
  });
  const [scoreId, setScoreId] = useState(existingScoreId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Computed values ───────────────────────────────────────────
  const computed = computeResults(components, attendance);

  // ── Load existing score data if a record already exists ───────
  const loadScore = useCallback(async () => {
    try {
      setLoading(true);
      // Always try the faculty API endpoint — returns 404 if no record exists
      const data = await facultyScoreApi.getStudentDetail(studentId, courseId);
      if (data && data._id) {
        applyScoreData(data);
        setScoreId(data._id);
      }
    } catch {
      // No existing score — that's okay, use the default empty form
      // (404 from faculty endpoint is caught here)
    } finally {
      setLoading(false);
    }
  }, [studentId, courseId]);

  useEffect(() => {
    loadScore();
  }, [loadScore]);

  // ── Apply fetched score data to the form ─────────────────────
  function applyScoreData(data) {
    if (data.components && data.components.length > 0) {
      // Merge existing components with our defaults
      const merged = DEFAULT_COMPONENTS.map((defComp) => {
        const existing = data.components.find(
          (c) => c.componentName === defComp.componentName
        );
        return existing
          ? { ...defComp, ...existing }
          : defComp;
      });
      setComponents(merged);
    }

    if (data.attendance) {
      setAttendance({
        classesAttended: data.attendance.classesAttended || 0,
        totalClasses: data.attendance.totalClasses || 0,
        requiredCutoff: data.attendance.requiredCutoff || 75
      });
    }
  }

  // ── Handle component field changes ────────────────────────────
  function handleComponentChange(index, field, value) {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: Number(value) || 0 };
    setComponents(updated);
  }

  // ── Handle attendance field changes ────────────────────────────
  function handleAttendanceChange(field, value) {
    setAttendance((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  }

  // ── Save the score (create or update) ─────────────────────────
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const scoreData = {
        studentId,
        courseId,
        courseName: course.CourseName || "",
        courseCode: course.CourseCode || "",
        credits: course.credits || 3,
        semester: course.semester || "",
        components,
        attendance
      };

      if (scoreId) {
        // Update existing score
        await facultyScoreApi.updateScore(scoreId, scoreData);
        setSuccess("Score updated successfully! ✅");
      } else {
        // Create new score record
        const result = await facultyScoreApi.createScore(scoreData);
        setScoreId(result.score._id);
        setSuccess("Score created successfully! ✅");
      }
    } catch (err) {
      console.error("Failed to save score:", err);
      setError(err.message || "Failed to save score. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Quick fill: auto-calculate total marks based on weightages ─
  function handleAutoFill() {
    const autoFilled = DEFAULT_COMPONENTS.map((defComp) => {
      const existing = components.find(
        (c) => c.componentName === defComp.componentName
      );
      // Suggest a reasonable total: weightage * some factor
      const suggestedTotal = defComp.finalWeightage * 2;
      return {
        ...(existing || defComp),
        totalMarks: existing?.totalMarks || suggestedTotal
      };
    });
    setComponents(autoFilled);
  }

  // ── Reset form to defaults ────────────────────────────────────
  function handleReset() {
    setComponents(DEFAULT_COMPONENTS);
    setAttendance({
      classesAttended: 0,
      totalClasses: 0,
      requiredCutoff: 75
    });
    setError("");
    setSuccess("");
  }

  // ── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-content">
        <div className="fm-loading">Loading score data...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* ════════════════════════════════════════════════════════════ */}
      {/*  HEADER — Back button + Student Info                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="fm-form-header">
        <button className="fm-back-btn" onClick={() => navigate("/faculty/scores")}>
          ← Back to Score Management
        </button>
      </div>

      {/* ── Student Information Banner ──────────────────────────── */}
      <div className="fm-student-info-card">
        <div className="fm-student-avatar">
          {student.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="fm-student-details">
          <h2>{student.name || "Student"}</h2>
          <div className="fm-student-tags">
            <span className="fm-tag">{student.email || "—"}</span>
            <span className="fm-tag">{student.phoneNumber || "No phone"}</span>
            <span className="fm-tag">{course.CourseName || "—"}</span>
            <span className="fm-tag">{course.CourseCode || "—"}</span>
          </div>
        </div>
        <div className="fm-student-summary">
          <div className="fm-summary-item">
            <span className="fm-summary-label">Overall %</span>
            <span className={`fm-summary-value ${getPctClass(computed.overallPercentage)}`}>
              {computed.overallPercentage > 0 ? `${computed.overallPercentage}%` : "—"}
            </span>
          </div>
          <div className="fm-summary-item">
            <span className="fm-summary-label">GPA</span>
            <span className="fm-summary-value">
              {computed.gpa > 0 ? computed.gpa.toFixed(2) : "—"}
            </span>
          </div>
          <div className="fm-summary-item">
            <span className="fm-summary-label">Grade</span>
            <span className="fm-summary-value">{computed.grade || "—"}</span>
          </div>
        </div>
      </div>

      {/* ── Success / Error Messages ────────────────────────────── */}
      {success && <div className="fm-success">{success}</div>}
      {error && <div className="fm-error">{error}</div>}

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  ASSESSMENT COMPONENTS FORM                                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      <form onSubmit={handleSave} className="fm-form">
        <div className="fm-card">
          <div className="fm-card-header">
            <h3>Assessment Components</h3>
            <div className="fm-card-actions">
              <button type="button" className="fm-btn-secondary" onClick={handleAutoFill}>
                Auto-Fill Totals
              </button>
              <button type="button" className="fm-btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          <div className="fm-table-responsive">
            <table className="fm-components-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Current Weightage (%)</th>
                  <th>Final Weightage (%)</th>
                  <th>% Achieved</th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp, index) => {
                  const compPct = comp.totalMarks > 0
                    ? ((comp.marksObtained / comp.totalMarks) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={comp.componentName}>
                      <td className="fm-cell-name">{comp.componentName}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={comp.marksObtained}
                          onChange={(e) =>
                            handleComponentChange(index, "marksObtained", e.target.value)
                          }
                          className="fm-input-sm"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={comp.totalMarks}
                          onChange={(e) =>
                            handleComponentChange(index, "totalMarks", e.target.value)
                          }
                          className="fm-input-sm"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={comp.currentWeightage}
                          onChange={(e) =>
                            handleComponentChange(index, "currentWeightage", e.target.value)
                          }
                          className="fm-input-xs"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={comp.finalWeightage}
                          onChange={(e) =>
                            handleComponentChange(index, "finalWeightage", e.target.value)
                          }
                          className="fm-input-xs"
                        />
                      </td>
                      <td>
                        <span className={`fm-pct-badge ${getPctClass(Number(compPct))}`}>
                          {compPct > 0 ? `${compPct}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  ATTENDANCE SECTION                                         */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="fm-card">
          <div className="fm-card-header">
            <h3>Attendance Record</h3>
          </div>
          <div className="fm-attendance-grid">
            <div className="fm-att-field">
              <label>Classes Attended</label>
              <input
                type="number"
                min="0"
                value={attendance.classesAttended}
                onChange={(e) => handleAttendanceChange("classesAttended", e.target.value)}
                className="fm-input"
                placeholder="0"
              />
            </div>
            <div className="fm-att-field">
              <label>Total Classes</label>
              <input
                type="number"
                min="0"
                value={attendance.totalClasses}
                onChange={(e) => handleAttendanceChange("totalClasses", e.target.value)}
                className="fm-input"
                placeholder="0"
              />
            </div>
            <div className="fm-att-field">
              <label>Required Cutoff (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={attendance.requiredCutoff}
                onChange={(e) => handleAttendanceChange("requiredCutoff", e.target.value)}
                className="fm-input"
              />
            </div>
            <div className="fm-att-field fm-att-result">
              <label>Attendance %</label>
              <span className={`fm-pct-badge ${getPctClass(computed.attendancePercentage)}`}>
                {computed.attendancePercentage > 0
                  ? `${computed.attendancePercentage}%`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  SUMMARY + SAVE BUTTON                                      */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="fm-card fm-summary-card">
          <div className="fm-summary-grid">
            <div className="fm-summary-box">
              <span className="fm-summary-box-label">Overall Percentage</span>
              <span className={`fm-summary-box-value ${getPctClass(computed.overallPercentage)}`}>
                {computed.overallPercentage > 0 ? `${computed.overallPercentage}%` : "—"}
              </span>
            </div>
            <div className="fm-summary-box">
              <span className="fm-summary-box-label">GPA (4.0 Scale)</span>
              <span className="fm-summary-box-value">
                {computed.gpa > 0 ? computed.gpa.toFixed(2) : "—"}
              </span>
            </div>
            <div className="fm-summary-box">
              <span className="fm-summary-box-label">Grade</span>
              <span className="fm-summary-box-value">{computed.grade || "—"}</span>
            </div>
            <div className="fm-summary-box">
              <span className="fm-summary-box-label">Attendance</span>
              <span className={`fm-summary-box-value ${getPctClass(computed.attendancePercentage)}`}>
                {computed.attendancePercentage > 0
                  ? `${computed.attendancePercentage}%`
                  : "—"}
              </span>
            </div>
          </div>

          <div className="fm-save-row">
            <button
              type="submit"
              className="fm-save-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : scoreId ? "Update Score" : "Create Score"}
            </button>
            {saving && <span className="fm-saving-hint">Auto-calculating GPA & percentage...</span>}
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Calculation helpers (client-side) ─────────────────────────────
// These match the backend calculation service so faculty see live
// previews before saving.

function calculateOverallPercentage(components = []) {
  if (!Array.isArray(components) || components.length === 0) return 0;
  let weightedSum = 0;
  let totalWeight = 0;
  components.forEach((c) => {
    const weight = c.finalWeightage || c.currentWeightage || 1;
    if (c.totalMarks > 0) {
      weightedSum += (c.marksObtained / c.totalMarks) * weight;
    }
    totalWeight += weight;
  });
  if (totalWeight === 0) return 0;
  return parseFloat(((weightedSum / totalWeight) * 100).toFixed(2));
}

function percentageToGPA(pct) {
  if (pct >= 90) return 4.0;
  if (pct >= 80) return 3.5;
  if (pct >= 70) return 3.0;
  if (pct >= 60) return 2.5;
  if (pct >= 50) return 2.0;
  if (pct >= 40) return 1.5;
  if (pct >= 30) return 1.0;
  return 0.0;
}

function percentageToGrade(pct) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B+";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C+";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D+";
  if (pct >= 30) return "D";
  return "F";
}

function calculateAttendancePercent(attendance = {}) {
  const { classesAttended = 0, totalClasses = 0 } = attendance;
  if (totalClasses === 0) return 0;
  return parseFloat(((classesAttended / totalClasses) * 100).toFixed(1));
}

function computeResults(components, attendance) {
  const overallPercentage = calculateOverallPercentage(components);
  const gpa = percentageToGPA(overallPercentage);
  const grade = percentageToGrade(overallPercentage);
  const attendancePercentage = calculateAttendancePercent(attendance);
  return { overallPercentage, gpa, grade, attendancePercentage };
}

function getPctClass(pct) {
  if (pct >= 75) return "fm-pct-excellent";
  if (pct >= 60) return "fm-pct-good";
  if (pct > 0) return "fm-pct-poor";
  return "";
}

export default StudentScoreForm;
