let Course = require("../models/Courses.model.js");
let User = require("../models/User.model.js");

function addCourse(req, res) {
    const { CourseName, CourseCode } = req.body;
    if (!CourseName || !CourseCode) {
        return res.status(400).json({ msg: "CourseName and CourseCode are required" });
    }

    const newCourse = new Course(req.body);
    newCourse.save()
        .then(() => res.status(201).json({ msg: "Course created", course: newCourse }))
        .catch(err => res.status(500).json({ msg: "Error creating course", error: err.message }));
}

function updateCourseById(req, res) {
    const { _id, CourseName, CourseCode } = req.body;
    if (!_id) return res.status(400).json({ msg: "_id is required" });

    Course.updateOne({ _id }, { CourseName, CourseCode })
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ msg: "Error updating course", error: err.message }));
}

function deleteCourse(req, res) {
    const _id = req.body?._id || req.query?._id;
    if (!_id) return res.status(400).json({ msg: "_id is required" });

    Course.deleteOne({ _id })
        .then(data => res.json({ msg: "Course deleted", data }))
        .catch(err => res.status(500).json({ msg: "Error deleting course", error: err.message }));
}

function addCourses(req, res) {
    Course.insertMany(req.body)
        .then(data => res.status(201).json({ msg: "Added all the courses", count: data.length }))
        .catch(err => res.status(500).json({ msg: "Error adding courses", error: err.message }));
}

function getCourseById(req, res) {
    const _id = req.query?._id || req.body?._id;
    if (!_id) return res.status(400).json({ msg: "_id is required" });

    Course.findById(_id)
        .then(data => data ? res.json(data) : res.status(404).json({ msg: "Course not found" }))
        .catch(err => res.status(500).json({ msg: "Error fetching course", error: err.message }));
}

function getAllCourses(req, res) {
    Course.find()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ msg: "Error fetching courses", error: err.message }));
}

function enrollStudent(req, res) {
    const { courseId, studentId } = req.body;
    if (!courseId || !studentId) {
        return res.status(400).json({ msg: "courseId and studentId are required" });
    }

    Course.findById(courseId)
        .then(course => {
            if (!course) return res.status(404).json({ msg: "Course not found" });
            return User.findById(studentId)
                .then(student => {
                    if (!student) return res.status(404).json({ msg: "Student not found" });
                    return Promise.all([
                        Course.updateOne({ _id: courseId }, { $addToSet: { enrolledStudents: studentId } }),
                        User.updateOne({ _id: studentId }, { $addToSet: { enrolledCourses: courseId } })
                    ]);
                });
        })
        .then(() => res.json({ msg: "Student enrolled", courseId, studentId }))
        .catch(err => res.status(500).json({ msg: "Error enrolling student", error: err.message }));
}

function getCourseStudents(req, res) {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ msg: "courseId is required" });

    Course.findById(courseId)
        .populate("enrolledStudents", "name email phoneNumber")
        .then(course => {
            if (!course) return res.status(404).json({ msg: "Course not found" });
            res.json({ courseId: course._id, CourseName: course.CourseName, students: course.enrolledStudents });
        })
        .catch(err => res.status(500).json({ msg: "Error fetching roster", error: err.message }));
}

module.exports = { addCourse, updateCourseById, deleteCourse, addCourses, getCourseById, getAllCourses, enrollStudent, getCourseStudents };

