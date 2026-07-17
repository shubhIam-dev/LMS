// Faculty Dashboard controller — aggregated data for the faculty dashboard.
// Returns courses taught by this faculty, assignments, and student counts.

const User = require("../models/User.model");
const Course = require("../models/Courses.model");
const Assignment = require("../models/assignments.model");
const Submission = require("../models/Submission.model");

// GET /dashboard/faculty
async function getFacultyDashboard(req, res) {
    try {
        const userId = req.user.id;

        // Fetch the faculty user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Find courses taught by this faculty member (using 'instructor' field)
        const courses = await Course.find({ instructor: userId });

        // Get all assignment IDs for these courses
        const courseIds = courses.map((c) => c._id);
        const assignments = await Assignment.find({
            courseId: { $in: courseIds },
        });

        // Count total students across all courses
        const studentCount = courses.reduce(
            (sum, c) => sum + (c.enrolledStudents?.length || (c.students?.length) || 0),
            0
        );

        // Count submissions for faculty's assignments
        const assignmentIds = assignments.map((a) => a._id);
        const submissions = await Submission.find({
            assignmentId: { $in: assignmentIds },
        });

        res.json({
            courses,
            assignments,
            stats: {
                courses: courses.length,
                assignments: assignments.length,
                students: studentCount,
                submissions: submissions.length,
                pendingGrading: submissions.filter((s) => s.status !== "graded").length,
            },
        });
    } catch (err) {
        console.error("Faculty dashboard error:", err);
        res.status(500).json({ msg: "Error fetching faculty dashboard", error: err.message });
    }
}

// GET /faculty/students — returns students assigned to the logged-in faculty
// Finds all courses where this faculty is the instructor, collects unique students.
async function getFacultyStudents(req, res) {
    try {
        const userId = req.user.id;

        // Find courses taught by this faculty
        const courses = await Course.find({ instructor: userId }).populate({
            path: "enrolledStudents",
            select: "name email phoneNumber",
        });

        // Collect unique students across all courses
        const seen = new Set();
        const students = [];
        for (const course of courses) {
            if (course.enrolledStudents && Array.isArray(course.enrolledStudents)) {
                for (const student of course.enrolledStudents) {
                    const id = String(student._id);
                    if (!seen.has(id)) {
                        seen.add(id);
                        students.push({
                            _id: student._id,
                            name: student.name,
                            email: student.email,
                            phoneNumber: student.phoneNumber,
                        });
                    }
                }
            }
        }

        // Also try to fetch profiles for department/semester info
        const Profile = require("../models/Profile.model");
        const profiles = await Profile.find({
            userId: { $in: students.map((s) => s._id) },
        }).select("userId studentId department semester batch branch course");

        const profileMap = {};
        for (const p of profiles) {
            profileMap[String(p.userId)] = p;
        }

        const enriched = students.map((s) => {
            const p = profileMap[String(s._id)] || {};
            return {
                ...s,
                rollNumber: p.studentId || "",
                department: p.department || "",
                semester: p.semester || "",
                batch: p.batch || "",
                branch: p.branch || "",
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error("Faculty students error:", err);
        res.status(500).json({ msg: "Error fetching students", error: err.message });
    }
}

module.exports = { getFacultyDashboard, getFacultyStudents };
