let Course = require("../models/Courses.model.js")
let User = require("../models/User.model.js")

function addCourse(req, res) {
    const { CourseName, CourseCode } = req.body
    if (!CourseName || !CourseCode) {
        return res.status(400).json({ msg: "CourseName and CourseCode are required" })
    }

    // Pass the whole body through so optional fields (description, credits,
    // semester, instructor, enrolledStudents) are saved too — the schema
    // ignores anything it doesn't define.
    const newCourse = new Course(req.body)
    newCourse.save()
        .then(() => res.status(201).json({ msg: "Course created", course: newCourse }))
        .catch((err) => res.status(500).json({ msg: "Error creating course", error: err.message }))
}

function updateCourseById(req, res) {
    const { _id } = req.body
    if (!_id) return res.status(400).json({ msg: "_id is required" })

    // Teacher ownership check
    if (req.user.role === "teacher") {
        return Course.findById(_id)
            .then((course) => {
                if (!course) return res.status(404).json({ msg: "Course not found" });
                if (String(course.instructor) !== req.user.id) {
                    return res.status(403).json({ msg: "You can only update your own courses" });
                }
                // Proceed with update
                const allowed = ["CourseName", "CourseCode", "credits", "semester", "description", "instructor"];
                const update = {};
                for (const field of allowed) {
                    if (req.body[field] !== undefined) update[field] = req.body[field];
                }
                return Course.findByIdAndUpdate(_id, update, { new: true, runValidators: true })
                    .then((course) => {
                        if (!course) return res.status(404).json({ msg: "Course not found" });
                        res.json({ msg: "Course updated", course });
                    });
            })
            .catch((err) => res.status(500).json({ msg: "Error updating course", error: err.message }));
    }

    // Superadmin: no check
    const allowed = ["CourseName", "CourseCode", "credits", "semester", "description", "instructor"];
    const update = {};
    for (const field of allowed) {
        if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    Course.findByIdAndUpdate(_id, update, { new: true, runValidators: true })
        .then((course) => {
            if (!course) return res.status(404).json({ msg: "Course not found" });
            res.json({ msg: "Course updated", course });
        })
        .catch((err) => res.status(500).json({ msg: "Error updating course", error: err.message }))
}

function deleteCourse(req, res) {
    const _id = req.body?._id || req.query?._id
    if (!_id) return res.status(400).json({ msg: "_id is required" })

    // Teacher ownership check
    if (req.user.role === "teacher") {
        return Course.findById(_id)
            .then((course) => {
                if (!course) return res.status(404).json({ msg: "Course not found" });
                if (String(course.instructor) !== req.user.id) {
                    return res.status(403).json({ msg: "You can only delete your own courses" });
                }
                return Course.deleteOne({ _id })
                    .then((data) => res.json({ msg: "Course deleted", data }));
            })
            .catch((err) => res.status(500).json({ msg: "Error deleting course", error: err.message }));
    }

    Course.deleteOne({ _id })
        .then((data) => res.json({ msg: "Course deleted", data }))
        .catch((err) => res.status(500).json({ msg: "Error deleting course", error: err.message }))
}

function addCourses(req, res) {
    Course.insertMany(req.body)
        .then((data) => res.status(201).json({ msg: "Added all the courses", count: data.length }))
        .catch((err) => res.status(500).json({ msg: "Error adding courses", error: err.message }))
}

function getCourseById(req, res) {
    const _id = req.query?._id || req.body?._id
    if (!_id) return res.status(400).json({ msg: "_id is required" })

    let filter = { _id };
    if (req.user.role === "teacher") {
        filter.instructor = req.user.id;
    }
    Course.findOne(filter)
        .populate("instructor", "name")
        .then((data) => data ? res.json(data) : res.status(404).json({ msg: "Course not found" }))
        .catch((err) => res.status(500).json({ msg: "Error fetching course", error: err.message }))
}

function getAllCourses(req, res) {
    let filter = {};
    if (req.user.role === "teacher") {
        filter = { instructor: req.user.id };
    }
    Course.find(filter)
        .populate("instructor", "name")
        .then((data) => res.json(data))
        .catch((err) => res.status(500).json({ msg: "Error fetching courses", error: err.message }))
}

// POST /course/enrollStudent
// Body: { courseId, studentId }
// A teacher enrolls a student in a course. This is a many-to-many link, so
// we update BOTH sides: the student appears in course.enrolledStudents AND
// the course appears in user.enrolledCourses. $addToSet prevents duplicates.
function enrollStudent(req, res) {
    const { courseId, studentId } = req.body;
    if (!courseId || !studentId) {
        return res.status(400).json({ msg: "courseId and studentId are required" });
    }

    Course.findById(courseId)
        .then((course) => {
            if (!course) return Promise.reject({ status: 404, msg: "Course not found" });
            // Teacher ownership check
            if (req.user.role === "teacher" && String(course.instructor) !== req.user.id) {
                return Promise.reject({ status: 403, msg: "You can only enroll students in your own courses" });
            }
            return User.findById(studentId);
        })
        .then((student) => {
            if (!student) return Promise.reject({ status: 404, msg: "Student not found" });
            return Promise.all([
                Course.updateOne({ _id: courseId }, { $addToSet: { enrolledStudents: studentId } }),
                User.updateOne({ _id: studentId }, { $addToSet: { enrolledCourses: courseId } })
            ]);
        })
        .then(() => res.json({ msg: "Student enrolled", courseId, studentId }))
        .catch((err) => {
            if (err && err.status) {
                return res.status(err.status).json({ msg: err.msg });
            }
            res.status(500).json({ msg: "Error enrolling student", error: err.message });
        });
}

// GET /course/getStudents?courseId=...   (staff only)
// The roster: every student enrolled in one course, with names/emails filled in.
function getCourseStudents(req, res) {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ msg: "courseId is required" });

    Course.findById(courseId)
        .populate("enrolledStudents", "name email phoneNumber")
        .then((course) => {
            if (!course) return res.status(404).json({ msg: "Course not found" });
            // Teacher ownership check
            if (req.user.role === "teacher" && String(course.instructor) !== req.user.id) {
                return res.status(403).json({ msg: "You can only view students in your own courses" });
            }
            res.json({ courseId: course._id, CourseName: course.CourseName, students: course.enrolledStudents });
        })
        .catch((err) => res.status(500).json({ msg: "Error fetching roster", error: err.message }));
}

// POST /course/selfEnroll
// Body: { courseId }
// A student enrolls THEMSELVES in a course (same logic as enrollStudent but
// reads the student ID from the authenticated token instead of the body).
function selfEnroll(req, res) {
    const { courseId } = req.body;
    const studentId = req.user.id;   // from JWT token — must be a student
    if (!courseId) {
        return res.status(400).json({ msg: "courseId is required" });
    }

    Course.findById(courseId)
        .then((course) => {
            if (!course) return Promise.reject({ status: 404, msg: "Course not found" });
            return User.findById(studentId);
        })
        .then((student) => {
            if (!student) return Promise.reject({ status: 404, msg: "Student not found" });
            if (student.role !== "student") return Promise.reject({ status: 403, msg: "Only students can self-enroll" });
            return Promise.all([
                Course.updateOne({ _id: courseId }, { $addToSet: { enrolledStudents: studentId } }),
                User.updateOne({ _id: studentId }, { $addToSet: { enrolledCourses: courseId } })
            ]);
        })
        .then(() => res.json({ msg: "Enrolled successfully", courseId, studentId }))
        .catch((err) => {
            if (err && err.status) {
                return res.status(err.status).json({ msg: err.msg });
            }
            res.status(500).json({ msg: "Error enrolling", error: err.message });
        });
}

// GET /course/progress?courseId=...&studentId=...
// Returns how many assignments in this course the student has completed,
// total marks, and pending assignments. Requires both params.
function getCourseProgress(req, res) {
    const { courseId, studentId } = req.query;
    if (!courseId || !studentId) {
        return res.status(400).json({ msg: "courseId and studentId are required" });
    }

    const Assignment = require("../models/assignments.model");
    const Submission = require("../models/Submission.model");

    let totalAssignments = 0;
    let submitted = 0;
    let graded = 0;
    let totalMarks = 0;
    let earnedMarks = 0;

    Assignment.find({ courseId })
        .then((assignments) => {
            totalAssignments = assignments.length;
            const ids = assignments.map((a) => a._id);
            return Submission.find({ studentId, assignmentId: { $in: ids } });
        })
        .then((submissions) => {
            submitted = submissions.length;
            graded = submissions.filter((s) => s.status === "graded").length;
            for (const s of submissions) {
                if (s.marksAwarded) earnedMarks += s.marksAwarded;
                if (s.totalMarks) totalMarks += s.totalMarks;
            }
            res.json({ courseId, studentId, totalAssignments, submitted, graded, earnedMarks, totalMarks });
        })
        .catch((err) => res.status(500).json({ msg: "Error fetching progress", error: err.message }));
}

module.exports = { addCourse, updateCourseById, deleteCourse, addCourses, getCourseById, getAllCourses, enrollStudent, getCourseStudents, selfEnroll, getCourseProgress }

