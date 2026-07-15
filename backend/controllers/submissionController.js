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

// POST /submissions/gradeManual
// Body: { submissionId, perQuestion: [{ questionId, marks }], }
// Rubric-style grading: the teacher awards marks per question (e.g. for long
// answers the auto-grader can't score). We clamp each award to [0, question.marks],
// store it on the answer, total it up, and record a Marks row.
async function gradeManual(req, res) {
    try {
        const { submissionId, perQuestion } = req.body;
        if (!submissionId || !Array.isArray(perQuestion)) {
            return res.status(400).json({ msg: "submissionId and perQuestion[] are required" });
        }

        const submission = await Submission.findById(submissionId);
        if (!submission) return res.status(404).json({ msg: "Submission not found" });

        const assignment = await Assignment.findById(submission.assignmentId).populate("courseId");
        if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

        // Max marks per question, for clamping.
        const questions = await Question.find({ _id: { $in: submission.answers.map(a => a.questionId) } });
        const maxById = new Map(questions.map(q => [String(q._id), q.marks || 0]));
        const awardById = new Map(perQuestion.map(p => [String(p.questionId), Number(p.marks) || 0]));

        let total = 0;
        for (const a of submission.answers) {
            const key = String(a.questionId);
            if (awardById.has(key)) {
                const max = maxById.get(key) ?? 0;
                a.awarded = Math.min(Math.max(awardById.get(key), 0), max);   // clamp 0..max
            }
            total += a.awarded || 0;
        }

        submission.marksAwarded = total;
        submission.status = "graded";
        await submission.save();

        const marksRow = new Marks({
            studentId:     submission.studentId,
            courseId:      assignment.courseId?._id,
            courseName:    assignment.courseId?.CourseName || "Unknown Course",
            marksObtained: total,
            totalMarks:    assignment.totalMarks || 0,
            examType:      "Assignment",
            semester:      assignment.courseId?.semester || "N/A"
        });
        await marksRow.save();

        res.json({ msg: "Graded", marksAwarded: total, totalMarks: assignment.totalMarks, submission });
    } catch (err) {
        res.status(500).json({ msg: "Error grading submission", error: err.message });
    }
}

module.exports = { submitAssignment, getSubmissionsByStudent, getSubmissionsByAssignment, gradeSubmission, gradeManual };
