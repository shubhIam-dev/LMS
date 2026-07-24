const express = require("express");
const router = express.Router();
let { authenticate, authorize } = require("../middleware/auth");
const {
    addAttendance,
    getAttendanceByCourse,
    getAttendanceById,
    updateAttendance,
    getStudentAttendance,
    getCourseStudents
} = require("../controllers/attendanceController");

// Teacher
router.post("/addAttendance", addAttendance);
router.put("/updateAttendance", updateAttendance);

// Teacher & Student
router.get("/getAttendanceByCourse", getAttendanceByCourse);
router.get("/getAttendanceById", getAttendanceById);
router.get("/getStudentAttendance", getStudentAttendance);

// Get students enrolled in a course
router.get("/getCourseStudents", getCourseStudents);
module.exports = router;