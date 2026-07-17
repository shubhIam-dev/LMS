const express = require("express");
const { getFacultyDashboard, getFacultyStudents } = require("../controllers/facultyDashboardController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Any signed-in faculty member can fetch their own dashboard.
router.get("/", authenticate, getFacultyDashboard);

// GET /faculty/students — faculty can view their assigned students
router.get("/students", authenticate, authorize("teacher", "superadmin"), getFacultyStudents);

module.exports = router;
