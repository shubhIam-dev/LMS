let express = require("express");
let {
    submitAssignment,
    getSubmissionsByStudent,
    getSubmissionsByAssignment,
    gradeSubmission,
    gradeManual
} = require("../controllers/submissionController.js");
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// A signed-in user submits their own work and views their own submissions.
router.post("/submit", authenticate, submitAssignment);
router.get("/getByStudent", authenticate, getSubmissionsByStudent);

// Reviewing everyone's submissions and grading is staff only.
const staff = [authenticate, authorize("teacher", "superadmin")];
router.get("/getByAssignment", staff, getSubmissionsByAssignment);
router.post("/grade", staff, gradeSubmission);
router.post("/gradeManual", staff, gradeManual);

module.exports = router;
