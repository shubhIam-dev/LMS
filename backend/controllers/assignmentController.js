const Assignment = require("../models/assignments.model");
const Question = require("../models/Question.model");

// POST /assignments/addAssignment
// A teacher creates an assignment tied to one course. `questions` (an array
// of Question _ids) is optional at creation — you can add them later with
// addQuestionsToAssignment. We recompute totalMarks from the referenced
// questions so it always matches reality.
async function addAssignment(req, res) {
    try {
        const { assignmentName, courseId } = req.body;
        if (!assignmentName || !courseId) {
            return res.status(400).json({ msg: "assignmentName and courseId are required" });
        }

        const assignment = new Assignment({ ...req.body, createdBy: req.user?.id });
        assignment.totalMarks = await sumMarks(assignment.questions);
        await assignment.save();

        res.status(201).json({ msg: "Assignment added successfully", assignment });
    } catch (err) {
        res.status(500).json({ msg: "Error adding assignment", error: err.message });
    }
}

// POST /assignments/addQuestionsToAssignment
// Body: { assignmentId, questionIds: [ ... ] }
// Appends existing questions to an assignment and recomputes totalMarks.
async function addQuestionsToAssignment(req, res) {
    try {
        const { assignmentId, questionIds } = req.body;
        if (!assignmentId || !Array.isArray(questionIds) || questionIds.length === 0) {
            return res.status(400).json({ msg: "assignmentId and a non-empty questionIds[] are required" });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

        // Avoid adding the same question twice.
        const existing = new Set(assignment.questions.map(String));
        for (const qid of questionIds) {
            if (!existing.has(String(qid))) assignment.questions.push(qid);
        }

        assignment.totalMarks = await sumMarks(assignment.questions);
        await assignment.save();

        res.json({ msg: "Questions added to assignment", assignment });
    } catch (err) {
        res.status(500).json({ msg: "Error adding questions to assignment", error: err.message });
    }
}

// GET /assignments/getAllAssignments
// Includes the parent course name AND who created it, so teachers can browse
// each other's assignments and pick ones to reuse.
function getAllAssignments(req, res) {
    Assignment.find()
        .populate("courseId", "CourseName CourseCode")
        .populate("createdBy", "name")
        .then((data) => res.json(data))
        .catch((err) => res.status(500).json({ msg: "Error fetching assignments", error: err.message }));
}

// POST /assignments/reuse
// Body: { assignmentId, courseId, dueOn? }
// Teacher B found teacher A's assignment and wants to give it to THEIR OWN
// students: clone it into B's course. The clone references the SAME questions
// (the bank is shared), but is a new assignment owned by B — so due dates and
// future edits don't affect A's original.
async function reuseAssignment(req, res) {
    try {
        const { assignmentId, courseId, dueOn } = req.body;
        if (!assignmentId || !courseId) {
            return res.status(400).json({ msg: "assignmentId and courseId are required" });
        }

        const original = await Assignment.findById(assignmentId);
        if (!original) return res.status(404).json({ msg: "Assignment not found" });

        const clone = new Assignment({
            assignmentName:   original.assignmentName,
            assignmentType:   original.assignmentType,
            assignmentTopics: original.assignmentTopics,
            questions:        original.questions,       // same shared questions
            totalMarks:       original.totalMarks,
            courseId,                                   // the reusing teacher's course
            dueOn:            dueOn || original.dueOn,
            createdBy:        req.user?.id              // the reusing teacher owns the clone
        });
        await clone.save();

        res.status(201).json({ msg: "Assignment reused into your course", assignment: clone });
    } catch (err) {
        res.status(500).json({ msg: "Error reusing assignment", error: err.message });
    }
}

// GET /assignments/getByCourse?courseId=...
// All assignments for one course.
function getAssignmentsByCourse(req, res) {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ msg: "courseId is required" });

    Assignment.find({ courseId })
        .then((data) => res.json(data))
        .catch((err) => res.status(500).json({ msg: "Error fetching assignments", error: err.message }));
}

// GET /assignments/getAssignmentById?id=...
// One assignment with its course AND every question filled in — this is what
// a student's "take assignment" page or a teacher's review page would load.
function getAssignmentById(req, res) {
    const { id } = req.query;
    Assignment.findById(id)
        .populate("courseId")
        .populate("questions")
        .then((data) => (data ? res.json(data) : res.status(404).json({ msg: "Assignment not found" })))
        .catch((err) => res.status(500).json({ msg: "Error fetching assignment", error: err.message }));
}

function deleteAssignment(req, res) {
    const { id } = req.body;
    Assignment.deleteOne({ _id: id })
        .then((data) => res.json({ msg: "Assignment deleted", data }))
        .catch((err) => res.status(500).json({ msg: "Error deleting assignment", error: err.message }));
}

// Helper: total marks = sum of the marks of the referenced questions.
async function sumMarks(questionIds = []) {
    if (!questionIds.length) return 0;
    const questions = await Question.find({ _id: { $in: questionIds } });
    return questions.reduce((sum, q) => sum + (q.marks || 0), 0);
}

module.exports = {
    addAssignment,
    addQuestionsToAssignment,
    getAllAssignments,
    getAssignmentsByCourse,
    getAssignmentById,
    deleteAssignment,
    reuseAssignment,
};
