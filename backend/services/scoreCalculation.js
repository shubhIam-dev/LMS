// Score Calculation Service
// Centralised helper that automatically computes:
//   • Overall percentage (weighted by component weightage)
//   • GPA (4.0 scale)
//   • Letter grade
//   • Attendance percentage
//
// Called by the faculty score controller whenever marks are saved,
// so faculty never have to calculate anything manually.

/**
 * Calculate overall percentage from weighted assessment components.
 *
 * Each component has:
 *   marksObtained   — what the student scored
 *   totalMarks      — maximum possible marks for that component
 *   currentWeightage — how much this component counts toward the final grade
 *   finalWeightage   — same; falls back to currentWeightage if set
 *
 * @param {Array} components — array of component objects
 * @returns {Number} — percentage (0–100), rounded to 2 decimals
 */
function calculateOverallPercentage(components = []) {
    if (!Array.isArray(components) || components.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    components.forEach((c) => {
        // Use finalWeightage if available, otherwise currentWeightage, else 1
        const weight = c.finalWeightage || c.currentWeightage || 1;
        if (c.totalMarks > 0) {
            weightedSum += (c.marksObtained / c.totalMarks) * weight;
        }
        totalWeight += weight;
    });

    if (totalWeight === 0) return 0;
    return parseFloat(((weightedSum / totalWeight) * 100).toFixed(2));
}

/**
 * Convert overall percentage to a 4.0 GPA scale.
 *
 *   ≥ 90  → 4.0   (A)
 *   ≥ 80  → 3.5   (B+)
 *   ≥ 70  → 3.0   (B)
 *   ≥ 60  → 2.5   (C+)
 *   ≥ 50  → 2.0   (C)
 *   ≥ 40  → 1.5   (D+)
 *   ≥ 30  → 1.0   (D)
 *   < 30  → 0.0   (F)
 *
 * @param {Number} pct — percentage (0–100)
 * @returns {Number} — GPA value (0.0–4.0)
 */
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

/**
 * Convert percentage to a letter grade (A–F).
 *
 * @param {Number} pct — percentage (0–100)
 * @returns {String} — letter grade
 */
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

/**
 * Calculate attendance percentage.
 *
 * @param {Object} attendance — { classesAttended, totalClasses }
 * @returns {Number} — percentage (0–100), rounded to 1 decimal
 */
function calculateAttendancePercent(attendance = {}) {
    const { classesAttended = 0, totalClasses = 0 } = attendance;
    if (totalClasses === 0) return 0;
    return parseFloat(((classesAttended / totalClasses) * 100).toFixed(1));
}

/**
 * Build a full computed result from components and attendance.
 * Returns everything a faculty member or student needs to see.
 *
 * @param {Array}  components  — assessment components array
 * @param {Object} attendance  — attendance object
 * @returns {Object} — { overallPercentage, gpa, grade, attendancePercentage }
 */
function computeFullResult(components = [], attendance = {}) {
    const overallPercentage = calculateOverallPercentage(components);
    const gpa = percentageToGPA(overallPercentage);
    const grade = percentageToGrade(overallPercentage);
    const attendancePercentage = calculateAttendancePercent(attendance);

    return {
        overallPercentage,
        gpa,
        grade,
        attendancePercentage
    };
}

module.exports = {
    calculateOverallPercentage,
    percentageToGPA,
    percentageToGrade,
    calculateAttendancePercent,
    computeFullResult
};
