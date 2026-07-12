// Submission controllers — a student's answers to an assignment,
// plus a simple auto-grader.

const Submission = require("../models/Submission.model");
const Question = require("../models/Question.model");
const Assignment = require("../models/assignments.model");
const Marks = require("../models/Marks.model");

// POST /submissions/submit
// Body: { assignmentId, studentId, answers: [{ questionId, answer }] }
function submitAssignment(req, res) {
    const { assignmentId, studentId, answers } = req.body;

    if (!assignmentId || !studentId || !Array.isArray(answers)) {
        return res.status(400).json({ msg: "assignmentId, studentId, and answers[] are required" });
    }

    const submission = new Submission({ assignmentId, studentId, answers });
    submission.save()
        .then(() => res.status(201).json({ msg: "Submission recorded", submission }))
        .catch(err => res.status(500).json({ msg: "Error recording submission", error: err.message }));
}

// GET /submissions/getByStudent?studentId=...
function getSubmissionsByStudent(req, res) {
    const { studentId } = req.query;
    Submission.find({ studentId })
        .populate("assignmentId")
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ msg: "Error fetching submissions", error: err.message }));
}

// GET /submissions/getByAssignment?assignmentId=...
function getSubmissionsByAssignment(req, res) {
    const { assignmentId } = req.query;
    Submission.find({ assignmentId })
        .populate("studentId", "name email")   // include only name + email of the student
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ msg: "Error fetching submissions", error: err.message }));
}

// POST /submissions/grade
// Body: { submissionId }
// Auto-grades by comparing each answer to Question.correctAnswer.
// Writes marksAwarded into the Submission and also creates a Marks row
// so the student's Marks page picks it up.
async function gradeSubmission(req, res) {
    try {
        const { submissionId } = req.body;
        if (!submissionId) return res.status(400).json({ msg: "submissionId is required" });

        const submission = await Submission.findById(submissionId);
        if (!submission) return res.status(404).json({ msg: "Submission not found" });

        const assignment = await Assignment.findById(submission.assignmentId).populate("courseId");
        if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

        const questionIds = submission.answers.map(a => a.questionId);
        const questions = await Question.find({ _id: { $in: questionIds } });
        const byId = new Map(questions.map(q => [String(q._id), q]));

        let awarded = 0;
        for (const a of submission.answers) {
            const q = byId.get(String(a.questionId));
            if (!q) continue;
            const expected = String(q.correctAnswer || "").trim().toLowerCase();
            const actual   = String(a.answer      || "").trim().toLowerCase();
            if (expected && expected === actual) awarded += q.marks || 0;
        }

        submission.marksAwarded = awarded;
        submission.status = "graded";
        await submission.save();

        // Record a corresponding Marks row so the student's grade sheet updates.
        const marksRow = new Marks({
            studentId:     submission.studentId,
            courseId:      assignment.courseId?._id,
            courseName:    assignment.courseId?.CourseName || "Unknown Course",
            marksObtained: awarded,
            totalMarks:    assignment.totalMarks || 0,
            examType:      "Assignment",
            semester:      assignment.courseId?.semester || "N/A"
        });
        await marksRow.save();

        res.json({ msg: "Graded", marksAwarded: awarded, totalMarks: assignment.totalMarks, submission, marks: marksRow });
    } catch (err) {
        res.status(500).json({ msg: "Error grading submission", error: err.message });
    }
}

module.exports = { submitAssignment, getSubmissionsByStudent, getSubmissionsByAssignment, gradeSubmission };
