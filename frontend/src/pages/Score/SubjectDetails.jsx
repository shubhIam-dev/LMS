// SubjectDetails — Detailed Score View for One Subject
// Professional university student portal layout.
// Shows course info + summary cards, assessment components table,
// attendance table, and a final summary row.

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { selectUser } from "../../store/authSlice";
import { scoreApi } from "./scoreApi";
import "./Score.css";

function SubjectDetails() {
  const { courseId } = useParams();
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Fetch detail ───────────────────────────────────────────────
  useEffect(() => {
    async function fetchDetail() {
      try {
        if (!user?._id || !courseId) {
          setError("Missing user or course information.");
          setLoading(false);
          return;
        }
        const data = await scoreApi.getByCourse(user._id, courseId);
        setScore(data);
      } catch (err) {
        console.error("Failed to load subject details:", err);
        setError("Could not load the score details for this subject.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [user, courseId]);

  // ── Helpers ────────────────────────────────────────────────────

  // Percentage for one component
  function getComponentPct(component) {
    if (!component.totalMarks || component.totalMarks === 0) return 0;
    return parseFloat(
      ((component.marksObtained / component.totalMarks) * 100).toFixed(1)
    );
  }

  // Whether a component has been graded (has real marks data)
  function isGraded(comp) {
    return (comp.marksObtained > 0 || comp.totalMarks > 0);
  }

  // CSS class based on percentage value
  function getPctClass(pct) {
    if (pct >= 75) return "sd-pct-excellent";
    if (pct >= 60) return "sd-pct-average";
    return "sd-pct-poor";
  }

  // Grades → relative performance label
  function getGradeLabel(pct) {
    if (pct >= 90) return "Outstanding";
    if (pct >= 75) return "Good";
    if (pct >= 60) return "Average";
    if (pct > 0)  return "Needs Work";
    return "";
  }

  // Format percentage
  function fmtPct(value) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return `${value}%`;
  }

  // Pass / Fail determination (≥ 40% = pass)
  function getResult(pct) {
    if (pct >= 40) return { label: "Pass", class: "sd-result-pass" };
    return { label: "Fail", class: "sd-result-fail" };
  }

  // Attendance status
  function getAttStatus(attPct, cutoff) {
    if (attPct >= cutoff) return { label: "Eligible", class: "sd-att-eligible" };
    return { label: "Shortage", class: "sd-att-shortage" };
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-content">
        <div className="sd-loading">Loading subject details…</div>
      </div>
    );
  }

  // ── Error / Not Found ──────────────────────────────────────────
  if (error || !score) {
    return (
      <div className="page-content">
        <div className="sd-error-state">
          <button className="sd-back-btn" onClick={() => navigate("/score")}>
            ← Back to Scorecard
          </button>
          <div className="sd-error-card">
            <div className="sd-error-icon">!</div>
            <h3>{error || "Score not found"}</h3>
            <p>We could not find the score data for this subject. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Derived Data ───────────────────────────────────────────────
  const overallPct = score.overallPercentage ?? 0;
  const gpa = score.gpa ?? 0;
  const att = score.attendance || {};
  const attPct = score.attendancePercentage ?? 0;
  const cutoff = att.requiredCutoff ?? 75;
  const components = score.components || [];
  const result = getResult(overallPct);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="page-content">

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  HEADER — course info (left) + summary cards (right)       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="sd-header-row">
        {/* Left: course info */}
        <div className="sd-course-info">
          <button className="sd-back-btn" onClick={() => navigate("/score")}>
            ← Back to Scorecard
          </button>
          <h1 className="sd-course-name">{score.courseName || "—"}</h1>
          <div className="sd-course-tags">
            <span className="sd-tag sd-tag-code">{score.courseCode || "—"}</span>
            <span className="sd-tag">{score.credits ? `${score.credits} Credits` : "—"}</span>
            <span className="sd-tag">{score.semester || "—"}</span>
            {score.updatedAt && (
              <span className="sd-tag sd-tag-muted">
                Updated {new Date(score.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Right: summary cards */}
        <div className="sd-summary-cards">
          {/* Overall Percentage */}
          <div className="sd-summary-card sd-card-primary">
            <div className="sd-card-label">Overall Score</div>
            <div className="sd-card-value">{fmtPct(overallPct)}</div>
            <div className="sd-card-sub">{getGradeLabel(overallPct) || "No data"}</div>
          </div>
          {/* Attendance */}
          <div className="sd-summary-card sd-card-accent">
            <div className="sd-card-label">Attendance</div>
            <div className="sd-card-value">{fmtPct(attPct)}</div>
            <div className="sd-card-sub">{attPct >= cutoff ? "On Track" : "At Risk"}</div>
          </div>
          {/* GPA */}
          <div className="sd-summary-card sd-card-violet">
            <div className="sd-card-label">GPA</div>
            <div className="sd-card-value">{gpa > 0 ? gpa.toFixed(2) : "—"}</div>
            <div className="sd-card-sub">
              {gpa >= 3.5 ? "Outstanding" : gpa >= 3.0 ? "Good" : gpa >= 2.0 ? "Satisfactory" : gpa > 0 ? "Below Avg" : "Not calculated"}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  ASSESSMENT COMPONENTS TABLE                                */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="sd-card-table">
        <div className="sd-card-table-header">
          <h3>Assessment Components</h3>
        </div>
        <div className="sd-table-responsive">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Current Weightage</th>
                <th>Final Weightage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {components.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sd-table-empty">
                    No components have been added yet.
                  </td>
                </tr>
              ) : (
                components.map((comp, idx) => {
                  const compPct = getComponentPct(comp);
                  const graded = isGraded(comp);
                  return (
                    <tr key={idx}>
                      <td className="sd-cell-name">{comp.componentName}</td>
                      <td className="sd-cell-marks">
                        {graded ? (comp.marksObtained ?? 0) : <span className="sd-ungraded">Not Graded</span>}
                      </td>
                      <td>{graded ? (comp.totalMarks ?? 0) : <span className="sd-ungraded">—</span>}</td>
                      <td className={`sd-cell-pct ${graded ? getPctClass(compPct) : ""}`}>
                        {graded ? fmtPct(compPct) : <span className="sd-ungraded">—</span>}
                      </td>
                      <td>{comp.currentWeightage ?? 0}%</td>
                      <td>{comp.finalWeightage ?? 0}%</td>
                      <td>
                        {graded ? (
                          <span className={`sd-badge ${compPct >= 75 ? "sd-badge-success" : compPct >= 60 ? "sd-badge-warning" : "sd-badge-danger"}`}>
                            Completed
                          </span>
                        ) : (
                          <span className="sd-badge sd-badge-muted">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  ATTENDANCE TABLE                                           */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="sd-card-table">
        <div className="sd-card-table-header">
          <h3>Attendance Record</h3>
        </div>
        <div className="sd-table-responsive">
          <table className="sd-table sd-table-att">
            <thead>
              <tr>
                <th>Classes Attended</th>
                <th>Total Classes</th>
                <th>Attendance %</th>
                <th>Required Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="sd-cell-marks">{att.classesAttended ?? 0}</td>
                <td>{att.totalClasses ?? 0}</td>
                <td className={`sd-cell-pct ${getPctClass(attPct)}`}>{fmtPct(attPct)}</td>
                <td>{cutoff}%</td>
                <td>
                  <span className={`sd-badge ${getAttStatus(attPct, cutoff).class === "sd-att-eligible" ? "sd-badge-success" : "sd-badge-danger"}`}>
                    {getAttStatus(attPct, cutoff).label}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  BOTTOM SUMMARY                                             */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="sd-bottom-summary">
        <div className="sd-summary-item">
          <div className="sd-summary-item-icon sd-icon-score">%</div>
          <div className="sd-summary-item-label">Overall Score</div>
          <div className={`sd-summary-item-value ${getPctClass(overallPct)}`}>
            {fmtPct(overallPct)}
          </div>
        </div>
        <div className="sd-summary-item">
          <div className="sd-summary-item-icon sd-icon-att">A</div>
          <div className="sd-summary-item-label">Attendance</div>
          <div className="sd-summary-item-value">
            {fmtPct(attPct)}
          </div>
        </div>
        <div className="sd-summary-item">
          <div className="sd-summary-item-icon sd-icon-gpa">G</div>
          <div className="sd-summary-item-label">GPA</div>
          <div className="sd-summary-item-value">
            {gpa > 0 ? gpa.toFixed(2) : "—"}
          </div>
        </div>
        <div className="sd-summary-item">
          <div className="sd-summary-item-icon sd-icon-result">R</div>
          <div className="sd-summary-item-label">Result</div>
          <div className={`sd-summary-item-value ${result.class}`}>
            {result.label}
          </div>
        </div>
      </div>

    </div>
  );
}

export default SubjectDetails;
