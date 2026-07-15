const Assignment = require("../models/assignments.model");
const Question = require("../models/Question.model");

function addAssignment(req, res) {
    const { assignmentName, courseId } = req.body;
    if (!assignmentName || !courseId) {
        return res.status(400).json({ msg: "assignmentName and courseId are required" });
    }

    const assignment = new Assignment({ ...req.body, createdBy: req.user?.id });
    sumMarks(assignment.questions)
        .then(total => {
            assignment.totalMarks = total;
            return assignment.save();
        })
        .then(() => res.status(201).json({ msg: "Assignment added successfully", assignment }))
        .catch(err => res.status(500).json({ msg: "Error adding assignment", error: err.message }));
}

function addQuestionsToAssignment(req, res) {
    const { assignmentId, questionIds } = req.body;
    if (!assignmentId || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ msg: "assignmentId and a non-empty questionIds[] are required" });
    }

    Assignment.findById(assignmentId)
        .then(assignment => {
            if (!assignment) return res.status(404).json({ msg: "Assignment not found" });
            const existing = new Set(assignment.questions.map(String));
            for (const qid of questionIds) {
                if (!existing.has(String(qid))) assignment.questions.push(qid);
            }
            return sumMarks(assignment.questions).then(total => {
                assignment.totalMarks = total;
                return assignment.save();
            });
        })
        .then(assignment => res.json({ msg: "Questions added to assignment", assignment }))
        .catch(err => res.status(500).json({ msg: "Error adding questions to assignment", error: err.message }));
}

function getAllAssignments(req, res) {
    Assignment.find()
        .populate("courseId", "CourseName CourseCode")
        .populate("createdBy", "name")
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ msg: "Error fetching assignments", error: err.message }));
}

function reuseAssignment(req, res) {
    const { assignmentId, courseId, dueOn } = req.body;
    if (!assignmentId || !courseId) {
        return res.status(400).json({ msg: "assignmentId and courseId are required" });
    }

    Assignment.findById(assignmentId)
        .then(original => {
            if (!original) return res.status(404).json({ msg: "Assignment not found" });
            const clone = new Assignment({
                assignmentName: original.assignmentName,
                assignmentType: original.assignmentType,
                assignmentTopics: original.assignmentTopics,
                questions: original.questions,
                totalMarks: original.totalMarks,
                courseId,
                dueOn: dueOn || original.dueOn,
                createdBy: req.user?.id
            });
            return clone.save();
        })
        .then(clone => res.status(201).json({ msg: "Assignment reused into your course", assignment: clone }))
        .catch(err => res.status(500).json({ msg: "Error reusing assignment", error: err.message }));
}

function getAssignmentsByCourse(req, res) {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ msg: "courseId is required" });

    Assignment.find({ courseId })
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ msg: "Error fetching assignments", error: err.message }));
}

function getAssignmentById(req, res) {
    const { id } = req.query;
    Assignment.findById(id)
        .populate("courseId")
        .populate("questions")
        .then(data => data ? res.json(data) : res.status(404).json({ msg: "Assignment not found" }))
        .catch(err => res.status(500).json({ msg: "Error fetching assignment", error: err.message }));
}

function deleteAssignment(req, res) {
    const { id } = req.body;
    Assignment.deleteOne({ _id: id })
        .then(data => res.json({ msg: "Assignment deleted", data }))
        .catch(err => res.status(500).json({ msg: "Error deleting assignment", error: err.message }));
}

function sumMarks(questionIds) {
    if (!questionIds || !questionIds.length) return Promise.resolve(0);
    return Question.find({ _id: { $in: questionIds } })
        .then(questions => questions.reduce((sum, q) => sum + (q.marks || 0), 0));
}

module.exports = {
    addAssignment, addQuestionsToAssignment, getAllAssignments,
    getAssignmentsByCourse, getAssignmentById, deleteAssignment, reuseAssignment
};
