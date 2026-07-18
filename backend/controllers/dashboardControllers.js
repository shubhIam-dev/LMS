// Dashboard controllers — aggregated data endpoint for the student dashboard.
// Instead of making 4+ separate API calls, a single /dashboard/student call
// returns everything: courses, assignments, submissions, marks, and computed
// summaries (pending/submitted/upcoming, internal/external breakdown, etc.).

const User = require("../models/User.model");
const Course = require("../models/Courses.model");
const Assignment = require("../models/assignments.model");
const Submission = require("../models/Submission.model");
const Marks = require("../models/Marks.model");

// GET /dashboard/student
// Returns a rich payload the StudentDashboard can render without extra fetches.
// Supports optional ?studentId=xxx for faculty viewing a specific student.
async function getStudentDashboard(req, res) {
    try {
        let userId = req.user.id;
        const role = req.user.role;
        const targetStudentId = req.query.studentId;

        // ── If faculty/superadmin is viewing a specific student, verify access ──
        if (targetStudentId && (role === "teacher" || role === "superadmin")) {
            // Find courses taught by this faculty
            const courses = await Course.find({ instructor: userId }).populate("enrolledStudents");
            let isAssigned = false;
            for (const course of courses) {
                if (course.enrolledStudents && Array.isArray(course.enrolledStudents)) {
                    for (const s of course.enrolledStudents) {
                        // Handle both populated objects and plain ObjectIds
                        const sid = String(s._id || s);
                        if (sid === targetStudentId) {
                            isAssigned = true;
                            break;
                        }
                    }
                    if (isAssigned) break;
                }
            }
            if (!isAssigned) {
                return res.status(403).json({ msg: "Forbidden — this student is not in your courses." });
            }
            // Use the target student's ID
            userId = targetStudentId;
        } else if (targetStudentId) {
            // Students cannot view other students' dashboards
            return res.status(403).json({ msg: "Forbidden — you can only view your own dashboard." });
        }

        // ── 1. Fetch the user with their enrolled courses populated ──
        const user = await User.findById(userId).populate("enrolledCourses");
        if (!user) return res.status(404).json({ msg: "User not found" });

        const courses = user.enrolledCourses || [];
        const courseIds = courses.map((c) => c._id);

        // Get the student name for read-only display (e.g., when faculty views a student)
        const studentName = user.name;

        // ── 2. Fetch assignments for those courses ──
        const assignments = await Assignment.find({
            courseId: { $in: courseIds },
        }).populate("courseId", "CourseName CourseCode");

    // ── 3. Fetch the student's submissions ──
    const submissions = await Submission.find({ studentId: userId })
      .populate({
        path: 'assignmentId',
        populate: { path: 'courseId', select: 'CourseName CourseCode' }
      });

        // ── 4. Fetch the student's marks ──
        const marks = await Marks.find({ studentId: userId });

        // ── 5. Build helper maps ──
        const submittedSet = new Set(
            submissions.map((s) => String(s.assignmentId))
        );
        const gradedSet = new Set(
            submissions
                .filter((s) => s.status === "graded")
                .map((s) => String(s.assignmentId))
        );

        const now = new Date();

        // ── 6. Categorise assignments ──
        const pending = assignments.filter(
            (a) =>
                !submittedSet.has(String(a._id)) &&
                (!a.dueOn || new Date(a.dueOn) >= now)
        );
        const overdue = assignments.filter(
            (a) =>
                !submittedSet.has(String(a._id)) &&
                a.dueOn &&
                new Date(a.dueOn) < now
        );
        const submitted = assignments.filter((a) =>
            submittedSet.has(String(a._id))
        );
        const graded = assignments.filter((a) => gradedSet.has(String(a._id)));

        // Upcoming deadlines: sorted soonest-first, limited to 5
        const upcomingDeadlines = [...pending]
            .filter((a) => a.dueOn)
            .sort((a, b) => new Date(a.dueOn) - new Date(b.dueOn))
            .slice(0, 5);

        // ── 7. Marks breakdown ──
        const internalMarks = marks.filter(
            (m) => m.examType === "Midterm" || m.examType === "Quiz"
        );
        const externalMarks = marks.filter((m) => m.examType === "Final");
        const assignmentMarks = marks.filter((m) => m.examType === "Assignment");

        const totalObtained = marks.reduce((s, m) => s + (m.marksObtained || 0), 0);
        const totalPossible = marks.reduce((s, m) => s + (m.totalMarks || 0), 0);
        const overallPercentage =
            totalPossible > 0
                ? Number(((totalObtained / totalPossible) * 100).toFixed(1))
                : 0;

        // Internal / external / assignment sub-percentages
        function calcPct(arr) {
            const o = arr.reduce((s, m) => s + (m.marksObtained || 0), 0);
            const p = arr.reduce((s, m) => s + (m.totalMarks || 0), 0);
            return { obtained: o, possible: p, percentage: p > 0 ? Number(((o / p) * 100).toFixed(1)) : 0 };
        }

        res.json({
            studentName,
            courses,
            assignments,
            submissions,
            marks,
            summary: {
                totalCourses: courses.length,
                totalAssignments: assignments.length,
                pendingCount: pending.length,
                overdueCount: overdue.length,
                submittedCount: submitted.length,
                gradedCount: graded.length,
                upcomingDeadlines,
            },
            marksBreakdown: {
                internal: calcPct(internalMarks),
                external: calcPct(externalMarks),
                assignments: calcPct(assignmentMarks),
                overall: {
                    obtained: totalObtained,
                    possible: totalPossible,
                    percentage: overallPercentage,
                    count: marks.length,
                },
                recentResults: marks
                    .sort((a, b) => new Date(b.createdAt || b._id.getTimestamp()) - new Date(a.createdAt || a._id.getTimestamp()))
                    .slice(0, 5),
            },
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ msg: "Error fetching dashboard data", error: err.message });
    }
}

module.exports = { getStudentDashboard };
