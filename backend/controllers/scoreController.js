// Score Controller — handles all student scorecard operations.
// Each "Score" document holds one student's complete performance in one course
// (all components + attendance + GPA).

const Score = require("../models/Score.model.js");
const { computeFullResult } = require("../services/scoreCalculation.js");

// ─────────────────────────────────────────────────────────────────
// GET /score/getByStudent?studentId=xxx
// Returns an overview of all courses for a student (one doc per course).
// Each doc includes the computed overall percentage and attendance %.
// ─────────────────────────────────────────────────────────────────
function getScoreByStudent(req, res) {
    const { studentId } = req.query;

    if (!studentId) {
        return res.status(400).json({ msg: "studentId is required" });
    }

    Score.find({ studentId })
        .populate("courseId", "CourseName CourseCode")
        .then((scores) => {
            // Attach computed fields for convenience
            const enriched = scores.map((s) => {
                const doc = s.toObject();
                const result = computeFullResult(doc.components, doc.attendance);
                doc.overallPercentage = result.overallPercentage;
                doc.attendancePercentage = result.attendancePercentage;
                doc.grade = result.grade;
                doc.gpa = doc.gpa || result.gpa;
                return doc;
            });
            res.json(enriched);
        })
        .catch((err) => {
            res.status(500).json({ msg: "Error fetching scores", error: err.message });
        });
}

// ─────────────────────────────────────────────────────────────────
// GET /score/getByCourse?studentId=xxx&courseId=yyy
// Returns the full detail of one student's score in one course.
// ─────────────────────────────────────────────────────────────────
function getScoreByCourse(req, res) {
    const { studentId, courseId } = req.query;

    if (!studentId || !courseId) {
        return res.status(400).json({ msg: "studentId and courseId are required" });
    }

    Score.findOne({ studentId, courseId })
        .then((score) => {
            if (!score) {
                return res.status(404).json({ msg: "Score not found for this course" });
            }
            const doc = score.toObject();
            const result = computeFullResult(doc.components, doc.attendance);
            doc.overallPercentage = result.overallPercentage;
            doc.attendancePercentage = result.attendancePercentage;
            doc.grade = result.grade;
            doc.gpa = doc.gpa || result.gpa;
            res.json(doc);
        })
        .catch((err) => {
            res.status(500).json({ msg: "Error fetching score", error: err.message });
        });
}

// ─────────────────────────────────────────────────────────────────
// POST /score/create
// Body: { studentId, courseId, courseName, courseCode, credits, semester,
//         components: [...], attendance: {...}, gpa }
// Creates a brand new score record for a student+course pair.
// ─────────────────────────────────────────────────────────────────
function createScore(req, res) {
    const {
        studentId, courseId, courseName, courseCode,
        credits, semester, components, attendance, gpa
    } = req.body;

    if (!studentId || !courseId || !courseName || !courseCode) {
        return res.status(400).json({
            msg: "Required fields: studentId, courseId, courseName, courseCode"
        });
    }

    const newScore = new Score({
        studentId,
        courseId,
        courseName,
        courseCode,
        credits: credits || 3,
        semester: semester || "",
        components: components || [],
        attendance: attendance || { classesAttended: 0, totalClasses: 0, requiredCutoff: 75 },
        gpa: gpa || 0.0
    });

    // Auto-compute GPA from overall percentage if not provided
    if (!gpa && gpa !== 0) {
        const overallPct = calculateOverallPercentage(components || []);
        newScore.gpa = percentageToGPA(overallPct);
    }

    newScore.save()
        .then((saved) => {
            res.status(201).json({ msg: "Score created successfully", score: saved });
        })
        .catch((err) => {
            if (err.code === 11000) {
                return res.status(409).json({
                    msg: "A score record already exists for this student + course. Use update instead."
                });
            }
            res.status(500).json({ msg: "Error creating score", error: err.message });
        });
}

// ─────────────────────────────────────────────────────────────────
// PUT /score/update
// Body: { studentId, courseId, ...any fields to update }
// Upserts — creates if missing, otherwise updates.
// ─────────────────────────────────────────────────────────────────
function updateScore(req, res) {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
        return res.status(400).json({ msg: "studentId and courseId are required" });
    }

    // Build the update object from allowed fields (skip _id and the lookup keys)
    const allowedFields = [
        "courseName", "courseCode", "credits", "semester",
        "components", "attendance", "gpa"
    ];
    const updateData = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    // If components are being updated, auto-recalculate GPA
    if (updateData.components) {
        const overallPct = calculateOverallPercentage(updateData.components);
        updateData.gpa = percentageToGPA(overallPct);
    }

    Score.findOneAndUpdate(
        { studentId, courseId },
        { $set: updateData },
        { new: true, upsert: true, runValidators: true }
    )
        .then((updated) => {
            res.json({ msg: "Score updated successfully", score: updated });
        })
        .catch((err) => {
            res.status(500).json({ msg: "Error updating score", error: err.message });
        });
}

// ─────────────────────────────────────────────────────────────────
// PUT /score/updateComponent
// Body: { studentId, courseId, componentName, marksObtained, totalMarks,
//         currentWeightage, finalWeightage }
// Updates or adds a specific component inside the components array.
// ─────────────────────────────────────────────────────────────────
function updateComponent(req, res) {
    const {
        studentId, courseId, componentName,
        marksObtained, totalMarks, currentWeightage, finalWeightage
    } = req.body;

    if (!studentId || !courseId || !componentName) {
        return res.status(400).json({
            msg: "Required fields: studentId, courseId, componentName"
        });
    }

    // Try to find the score doc first
    Score.findOne({ studentId, courseId })
        .then((score) => {
            if (!score) {
                return res.status(404).json({ msg: "Score not found. Create it first." });
            }

            // Look for an existing component with the same name
            const existingIdx = score.components.findIndex(
                (c) => c.componentName === componentName
            );

            const componentUpdate = {
                marksObtained: marksObtained ?? 0,
                totalMarks: totalMarks ?? 0,
                currentWeightage: currentWeightage ?? 0,
                finalWeightage: finalWeightage ?? 0
            };

            if (existingIdx !== -1) {
                // Update the existing component
                score.components[existingIdx] = {
                    ...score.components[existingIdx].toObject(),
                    ...componentUpdate
                };
            } else {
                // Add a new component
                score.components.push({
                    componentName,
                    ...componentUpdate
                });
            }

            // Recalculate GPA from the updated components
            const overallPct = calculateOverallPercentage(score.components);
            score.gpa = percentageToGPA(overallPct);

            return score.save();
        })
        .then((updated) => {
            res.json({ msg: "Component updated successfully", score: updated });
        })
        .catch((err) => {
            res.status(500).json({ msg: "Error updating component", error: err.message });
        });
}

// ─────────────────────────────────────────────────────────────────
// DELETE /score/delete
// Body: { studentId, courseId }
// Deletes the entire score record for a student+course pair.
// ─────────────────────────────────────────────────────────────────
function deleteScore(req, res) {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
        return res.status(400).json({ msg: "studentId and courseId are required" });
    }

    Score.findOneAndDelete({ studentId, courseId })
        .then((deleted) => {
            if (!deleted) {
                return res.status(404).json({ msg: "Score not found" });
            }
            res.json({ msg: "Score deleted successfully" });
        })
        .catch((err) => {
            res.status(500).json({ msg: "Error deleting score", error: err.message });
        });
}

// ── Helpers ──────────────────────────────────────────────────────

// Converts overall percentage to a 4.0 GPA scale.
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

// Computes overall percentage from weighted components.
function calculateOverallPercentage(components = []) {
    if (!components.length) return 0;

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

// Computes attendance percentage.
function calculateAttendancePercent(attendance = {}) {
    const { classesAttended = 0, totalClasses = 0 } = attendance;
    if (totalClasses === 0) return 0;
    return parseFloat(((classesAttended / totalClasses) * 100).toFixed(1));
}

module.exports = {
    getScoreByStudent,
    getScoreByCourse,
    createScore,
    updateScore,
    updateComponent,
    deleteScore
};
