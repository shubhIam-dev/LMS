// Score Model — Tracks a student's complete scorecard for one subject.
// Each document = one student's performance in one course, including all
// assessment components (Contests, Mid Semester, etc.) and attendance.

let mongoose = require("mongoose");

let scoreSchema = new mongoose.Schema({
    // ── Student & Course References ──────────────────────────────
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true
    },

    // Denormalised course info so we don't need joins for the overview.
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true },
    credits:    { type: Number, default: 3 },
    semester:   { type: String, default: "" },

    // ── Assessment Components ────────────────────────────────────
    // Each component is one graded item: "Contest 1", "Mid Semester Exam", etc.
    components: [
        {
            componentName:    { type: String, required: true }, // e.g. "Contest 1"
            marksObtained:    { type: Number, default: 0 },
            totalMarks:       { type: Number, default: 0 },
            currentWeightage: { type: Number, default: 0 }, // e.g. 10 = 10%
            finalWeightage:   { type: Number, default: 0 }
        }
    ],

    // ── Attendance ───────────────────────────────────────────────
    attendance: {
        classesAttended: { type: Number, default: 0 },
        totalClasses:    { type: Number, default: 0 },
        requiredCutoff:  { type: Number, default: 75 } // minimum % required
    },

    // ── Computed Summary ─────────────────────────────────────────
    gpa: { type: Number, default: 0.0 }

}, { timestamps: true }); // createdAt / updatedAt auto-managed

// One score document per student per course (upsert-friendly).
scoreSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Score", scoreSchema);
