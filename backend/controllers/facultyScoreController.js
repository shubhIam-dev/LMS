// Faculty Score Controller — faculty-only score management.
//
// These endpoints let teachers:
//   1. View all students enrolled in a course (with their current scores)
//   2. View one student's full score document for a course
//   3. Create a new score record (if none exists for that student + course)
//   4. Update an existing score record
//   5. Delete a score record (optional)
//
// Every write operation auto-calculates GPA, overall percentage, and grade
// so faculty never have to compute anything manually.
//
// IMPORTANT: This reuses the EXISTING Score model — no new collections are
// created. Students see updated marks immediately via their /score endpoints.

const Score = require("../models/Score.model.js");
const Course = require("../models/Courses.model.js");
const { computeFullResult } = require("../services/scoreCalculation.js");

// ─────────────────────────────────────────────────────────────────
// GET /faculty/scores/course/:courseId
// Returns ALL students enrolled in the given course, along with their
// current score document (if one exists).
//
// Response shape:
//   {
//     course: { ... course info },
//     students: [
//       {
//         _id, name, email, phoneNumber,  ← from User
//         score: { ... Score doc or null }  ← their score for this course
//       }
//     ]
//   }
// ─────────────────────────────────────────────────────────────────
async function getCourseStudentsWithScores(req, res) {
    try {
        const { courseId } = req.params;

        // 1. Fetch the course with populated enrolled students
        const course = await Course.findById(courseId)
            .populate("enrolledStudents", "name email phoneNumber");

        if (!course) {
            return res.status(404).json({ msg: "Course not found" });
        }

        // 2. Get the list of enrolled students
        const students = course.enrolledStudents || [];

        // 3. For each student, find their Score document for this course
        const studentIds = students.map((s) => s._id);
        const scores = await Score.find({
            studentId: { $in: studentIds },
            courseId: courseId
        });

        // Build a lookup map: studentId → Score doc
        const scoreMap = {};
        scores.forEach((sc) => {
            scoreMap[String(sc.studentId)] = sc;
        });

        // 4. Merge students with their scores, attaching computed fields
        const enrichedStudents = students.map((student) => {
            const scoreDoc = scoreMap[String(student._id)] || null;
            let computed = null;

            if (scoreDoc) {
                const doc = scoreDoc.toObject();
                const result = computeFullResult(doc.components, doc.attendance);
                computed = {
                    ...doc,
                    overallPercentage: result.overallPercentage,
                    attendancePercentage: result.attendancePercentage,
                    gpa: doc.gpa || result.gpa,
                    grade: result.grade
                };
            }

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                phoneNumber: student.phoneNumber,
                score: computed
            };
        });

        res.json({
            course: {
                _id: course._id,
                CourseName: course.CourseName,
                CourseCode: course.CourseCode,
                credits: course.credits,
                semester: course.semester
            },
            students: enrichedStudents
        });
    } catch (err) {
        console.error("Error fetching course students with scores:", err);
        res.status(500).json({ msg: "Error fetching students", error: err.message });
    }
}

// ─────────────────────────────────────────────────────────────────
// GET /faculty/scores/student/:studentId/:courseId
// Returns the COMPLETE score document for one student in one course.
// ─────────────────────────────────────────────────────────────────
async function getStudentScoreDetail(req, res) {
    try {
        const { studentId, courseId } = req.params;

        const score = await Score.findOne({ studentId, courseId });

        if (!score) {
            return res.status(404).json({ msg: "No score record found for this student in this course." });
        }

        // Attach computed fields
        const doc = score.toObject();
        const result = computeFullResult(doc.components, doc.attendance);
        doc.overallPercentage = result.overallPercentage;
        doc.attendancePercentage = result.attendancePercentage;
        doc.grade = result.grade;

        res.json(doc);
    } catch (err) {
        console.error("Error fetching student score detail:", err);
        res.status(500).json({ msg: "Error fetching score detail", error: err.message });
    }
}

// ─────────────────────────────────────────────────────────────────
// POST /faculty/scores
// Creates a NEW score record for a student + course pair.
// If one already exists, returns 409 (Conflict) so the faculty knows
// to use PUT/update instead.
//
// Body: {
//   studentId, courseId, courseName, courseCode,
//   credits, semester, components, attendance
// }
// ─────────────────────────────────────────────────────────────────
async function createScore(req, res) {
    try {
        const {
            studentId, courseId, courseName, courseCode,
            credits, semester, components, attendance
        } = req.body;

        // Validate required fields
        if (!studentId || !courseId || !courseName || !courseCode) {
            return res.status(400).json({
                msg: "Required fields: studentId, courseId, courseName, courseCode"
            });
        }

        // Check if a score record already exists
        const existing = await Score.findOne({ studentId, courseId });
        if (existing) {
            return res.status(409).json({
                msg: "A score record already exists for this student + course. Use update instead.",
                score: existing
            });
        }

        // Auto-calculate GPA from components
        const { gpa } = computeFullResult(components || [], attendance || {});

        const newScore = new Score({
            studentId,
            courseId,
            courseName,
            courseCode,
            credits: credits || 3,
            semester: semester || "",
            components: components || [],
            attendance: attendance || { classesAttended: 0, totalClasses: 0, requiredCutoff: 75 },
            gpa
        });

        const saved = await newScore.save();
        res.status(201).json({ msg: "Score created successfully", score: saved });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                msg: "Duplicate entry. A score record already exists for this student + course."
            });
        }
        console.error("Error creating score:", err);
        res.status(500).json({ msg: "Error creating score", error: err.message });
    }
}

// ─────────────────────────────────────────────────────────────────
// PUT /faculty/scores/:id
// Updates an EXISTING score document (identified by its _id).
// NOTICE: Unlike the old scoreController which uses studentId+courseId,
// this one uses the document _id directly (cleaner for faculty flow).
//
// Body: { components, attendance, credits, semester, ... }
// ─────────────────────────────────────────────────────────────────
async function updateScoreById(req, res) {
    try {
        const { id } = req.params;

        // Find the existing score document
        const score = await Score.findById(id);
        if (!score) {
            return res.status(404).json({ msg: "Score record not found" });
        }

        // Allowed updatable fields
        const {
            components, attendance, credits, semester,
            courseName, courseCode
        } = req.body;

        // Update fields if provided
        if (components !== undefined) score.components = components;
        if (attendance !== undefined) score.attendance = attendance;
        if (credits !== undefined) score.credits = credits;
        if (semester !== undefined) score.semester = semester;
        if (courseName !== undefined) score.courseName = courseName;
        if (courseCode !== undefined) score.courseCode = courseCode;

        // Auto-recalculate GPA from updated components + attendance
        const { gpa } = computeFullResult(score.components, score.attendance);
        score.gpa = gpa;

        const updated = await score.save();

        // Attach computed fields for the response
        const doc = updated.toObject();
        const result = computeFullResult(doc.components, doc.attendance);
        doc.overallPercentage = result.overallPercentage;
        doc.attendancePercentage = result.attendancePercentage;
        doc.grade = result.grade;

        res.json({ msg: "Score updated successfully", score: doc });
    } catch (err) {
        console.error("Error updating score:", err);
        res.status(500).json({ msg: "Error updating score", error: err.message });
    }
}

// ─────────────────────────────────────────────────────────────────
// DELETE /faculty/scores/:id
// Deletes a score document by its _id.
// (Optional — included for completeness.)
// ─────────────────────────────────────────────────────────────────
async function deleteScore(req, res) {
    try {
        const { id } = req.params;

        const deleted = await Score.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ msg: "Score record not found" });
        }

        res.json({ msg: "Score deleted successfully" });
    } catch (err) {
        console.error("Error deleting score:", err);
        res.status(500).json({ msg: "Error deleting score", error: err.message });
    }
}

module.exports = {
    getCourseStudentsWithScores,
    getStudentScoreDetail,
    createScore,
    updateScoreById,
    deleteScore
};
