const Assignment = require("../models/assignments.model");
const Question = require("../models/Question.model");
const Course = require("../models/Courses.model.js");

// POST /assignments/addAssignment
// A teacher creates an assignment tied to one course. `questions` (an array
// of Question _ids) is optional at creation — you can add them later with
// addQuestionsToAssignment. We recompute totalMarks from the referenced
// questions so it always matches reality.
function addAssignment(req, res) {
    const { assignmentName, courseId } = req.body;
    if (!assignmentName || !courseId) {
        return res.status(400).json({ msg: "assignmentName and courseId are required" });
    }

    // Teacher ownership check
    if (req.user.role === "teacher") {
        return Course.findById(courseId)
            .then((course) => {
                if (!course) return res.status(404).json({ msg: "Course not found" });
                if (String(course.instructor) !== req.user.id) {
                    return res.status(403).json({ msg: "You can only create assignments for your own courses" });
                }
                // Proceed with creation
                const assignment = new Assignment({ ...req.body, createdBy: req.user?.id });
                return sumMarks(assignment.questions)
                    .then((total) => {
                        assignment.totalMarks = total;
                        return assignment.save();
                    })
                    .then(() => res.status(201).json({ msg: "Assignment added successfully", assignment }));
            })
            .catch((err) => res.status(500).json({ msg: "Error adding assignment", error: err.message }));
    }

    const assignment = new Assignment({ ...req.body, createdBy: req.user?.id });
    sumMarks(assignment.questions)
        .then((total) => {
            assignment.totalMarks = total;
            return assignment.save();
        })
        .then(() => res.status(201).json({ msg: "Assignment added successfully", assignment }))
        .catch((err) => res.status(500).json({ msg: "Error adding assignment", error: err.message }));
}

// POST /assignments/addQuestionsToAssignment
// Body: { assignmentId, questionIds: [ ... ] }
// Appends existing questions to an assignment and recomputes totalMarks.
function addQuestionsToAssignment(req, res) {
    const { assignmentId, questionIds } = req.body;
    if (!assignmentId || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ msg: "assignmentId and a non-empty questionIds[] are required" });
    }

    Assignment.findById(assignmentId)
        .then((assignment) => {
            if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

            // Avoid adding the same question twice.
            const existing = new Set(assignment.questions.map(String));
            for (const qid of questionIds) {
                if (!existing.has(String(qid))) assignment.questions.push(qid);
            }

            return sumMarks(assignment.questions).then((total) => {
                assignment.totalMarks = total;
                return assignment.save().then(() => res.json({ msg: "Questions added to assignment", assignment }));
            });
        })
        .catch((err) => res.status(500).json({ msg: "Error adding questions to assignment", error: err.message }));
}

// GET /assignments/getAllAssignments
// Includes the parent course name AND who created it, so teachers can browse
// each other's assignments and pick ones to reuse.
function getAllAssignments(req, res) {
    let filter = {};
    if (req.user.role === "teacher") {
        // 1st find teacher's courses, then only their assignments
        const Course = require("../models/Courses.model.js");
        return Course.find({ instructor: req.user.id }).select("_id")
            .then((courses) => {
                const courseIds = courses.map((c) => c._id);
                return Assignment.find({ courseId: { $in: courseIds } })
                    .populate("courseId", "CourseName CourseCode")
                    .populate("createdBy", "name");
            })
            .then((data) => res.json(data))
            .catch((err) => res.status(500).json({ msg: "...", error: err.message }));
    }
    // Superadmin/student: no filter
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
function reuseAssignment(req, res) {
    const { assignmentId, courseId, dueOn } = req.body;
    if (!assignmentId || !courseId) {
        return res.status(400).json({ msg: "assignmentId and courseId are required" });
    }

    Assignment.findById(assignmentId)
        .then((original) => {
            if (!original) return res.status(404).json({ msg: "Assignment not found" });

            const clone = new Assignment({
                assignmentName: original.assignmentName,
                assignmentType: original.assignmentType,
                assignmentTopics: original.assignmentTopics,
                questions: original.questions,       // same shared questions
                totalMarks: original.totalMarks,
                courseId,                                   // the reusing teacher's course
                dueOn: dueOn || original.dueOn,
                createdBy: req.user?.id              // the reusing teacher owns the clone
            });
            return clone.save().then(() => res.status(201).json({ msg: "Assignment reused into your course", assignment: clone }));
        })
        .catch((err) => res.status(500).json({ msg: "Error reusing assignment", error: err.message }));
}

// GET /assignments/getByCourse?courseId=...
// All assignments for one course.
function getAssignmentsByCourse(req, res) {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ msg: "courseId is required" });

    // Teacher ownership check
    if (req.user.role === "teacher") {
        return Course.findById(courseId)
            .then((course) => {
                if (!course) return res.status(404).json({ msg: "Course not found" });
                if (String(course.instructor) !== req.user.id) {
                    return res.status(403).json({ msg: "You can only view assignments for your own courses" });
                }
                return Assignment.find({ courseId })
                    .then((data) => res.json(data));
            })
            .catch((err) => res.status(500).json({ msg: "Error fetching assignments", error: err.message }));
    }

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

    // Teacher ownership check
    if (req.user.role === "teacher") {
        return Assignment.findById(id)
            .then((assignment) => {
                if (!assignment) return res.status(404).json({ msg: "Assignment not found" });
                return Course.findById(assignment.courseId)
                    .then((course) => {
                        if (!course || String(course.instructor) !== req.user.id) {
                            return res.status(403).json({ msg: "You can only delete assignments from your own courses" });
                        }
                        return Assignment.deleteOne({ _id: id })
                            .then((data) => res.json({ msg: "Assignment deleted", data }));
                    });
            })
            .catch((err) => res.status(500).json({ msg: "Error deleting assignment", error: err.message }));
    }

    Assignment.deleteOne({ _id: id })
        .then((data) => res.json({ msg: "Assignment deleted", data }))
        .catch((err) => res.status(500).json({ msg: "Error deleting assignment", error: err.message }));
}

// Helper: total marks = sum of the marks of the referenced questions.
function sumMarks(questionIds = []) {
    if (!questionIds.length) return Promise.resolve(0);
    return Question.find({ _id: { $in: questionIds } })
        .then((questions) => questions.reduce((sum, q) => sum + (q.marks || 0), 0));
}


function updateAssignmentById(req, res) {
    const { id } = req.body

    // Helper to check teacher ownership
    const checkOwner = (assignment) => {
        if (req.user.role === "teacher") {
            return Course.findById(assignment.courseId)
                .then((course) => {
                    if (!course || String(course.instructor) !== req.user.id) {
                        return Promise.reject({ status: 403, msg: "You can only update assignments from your own courses" });
                    }
                });
        }
        return Promise.resolve();
    };

    Assignment.findById(id).then((assignment) => {
        if (!assignment) {
            return res.status(404).json({ msg: "Assignment Not Found" })
        }
        return checkOwner(assignment).then(() => {
            assignment.assignmentName = req.body.assignmentName ?? assignment.assignmentName
            assignment.assignmentType = req.body.assignmentType ?? assignment.assignmentType
            assignment.assignmentTopics = req.body.assignmentTopics ?? assignment.assignmentTopics
            assignment.courseId = req.body.courseId ?? assignment.courseId
            assignment.dueOn = req.body.dueOn ?? assignment.dueOn

            if (req.body.questions) {
                assignment.questions = req.body.questions;
                return sumMarks(assignment.questions)
                    .then((total) => {
                        assignment.totalMarks = total;
                        return assignment.save();
                    })
                    .then((updatedAssignment) => {
                        res.json({
                            msg: "Assignment updated successfully",
                            assignment: updatedAssignment
                        });
                    });
            }
            return assignment.save()
                .then((updatedAssignment) => {
                    res.json({
                        msg: "Assignment updated successfully",
                        assignment: updatedAssignment
                    });
                });
        });
    })
        .catch((err) => {
            if (err && err.status) {
                return res.status(err.status).json({ msg: err.msg });
            }
            res.status(500).json({
                msg: "Error updating assignment",
                error: err.message
            });
        })
}


module.exports = { addAssignment, addQuestionsToAssignment, getAllAssignments, getAssignmentsByCourse, getAssignmentById, deleteAssignment, reuseAssignment, updateAssignmentById };