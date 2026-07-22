// Admin dashboard controller -system-wide stats for super admin 
// Return user ccouts all courses ,assignmnets anf recebt activity 

const User=require("../models/User.model")
const Course=require("../models/Courses.model")
const Assignment=require("../models/assignments.model")
const Submission=require("../models/Submission.model")

// admin Dashboard
function getAdminDashboard(req, res) {
    Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "superadmin" }),
        Course.find({}).populate("instructor", "name email"),
        Assignment.find({})
            .populate("courseId", "CourseName CourseCode")
            .populate("createdBy", "name"),
        Submission.find({})
            .populate("studentId", "name email")
            .populate("assignmentId", "assignmentName")
            .sort({ createdAt: -1 })
            .limit(10),
        User.find({})
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(10),
        Submission.countDocuments({}),
        Submission.countDocuments({ status: "graded" })
    ])
    .then(function (result) {
        const studentCount = result[0];
        const teacherCount = result[1];
        const adminCount = result[2];
        const courses = result[3];
        const assignments = result[4];
        const recentSubmissions = result[5];
        const recentUsers = result[6];
        const totalSubmissions = result[7];
        const gradedSubmissions = result[8];

        res.json({
            stats: {
                totalStudents: studentCount,
                totalTeachers: teacherCount,
                totalAdmins: adminCount,
                totalUsers: studentCount + teacherCount + adminCount,
                totalCourses: courses.length,
                totalAssignments: assignments.length,
                totalSubmissions: totalSubmissions,
                pendingGrading: totalSubmissions - gradedSubmissions
            },
            courses,
            assignments,
            recentSubmissions,
            recentUsers
        });
    })
    .catch(function (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    });
}

module.exports = { getAdminDashboard };