// Faculty Score Routes — wire up the faculty score controller.
//
// All routes require:
//   1. authenticate — valid JWT token
//   2. authorize("teacher", "superadmin") — only faculty can manage scores
//
// Students can STILL view scores via the existing /score routes
// (scoreRoutes.js), which is what the student Scorecard uses.
// These faculty routes are ONLY for faculty to CRUD scores.

let express = require("express");
let {
    getCourseStudentsWithScores,
    getStudentScoreDetail,
    createScore,
    updateScoreById,
    deleteScore
} = require("../controllers/facultyScoreController.js");
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// All faculty score routes require authentication + teacher/superadmin role
const facultyAuth = [authenticate, authorize("teacher", "superadmin")];

// ── Get all students enrolled in a course with their scores ──────
router.get("/course/:courseId", facultyAuth, getCourseStudentsWithScores);

// ── Get one student's complete score detail for a course ─────────
router.get("/student/:studentId/:courseId", facultyAuth, getStudentScoreDetail);

// ── Create a new score record ────────────────────────────────────
router.post("/", facultyAuth, createScore);

// ── Update an existing score record by ID ────────────────────────
router.put("/:id", facultyAuth, updateScoreById);

// ── Delete a score record by ID (optional) ───────────────────────
router.delete("/:id", facultyAuth, deleteScore);

module.exports = router;
