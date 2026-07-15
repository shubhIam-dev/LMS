let express = require("express");
let {
    submitAssignment,
    getSubmissionsByStudent,
    getSubmissionsByAssignment,
<<<<<<< HEAD
    gradeSubmission
} = require("../controllers/submissionController.js");

const router = express.Router();

router.post("/submit",              submitAssignment);
router.get("/getByStudent",         getSubmissionsByStudent);
router.get("/getByAssignment",      getSubmissionsByAssignment);
router.post("/grade",               gradeSubmission);
=======
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
router.post("/grade", staff, gradeSubmission);          // auto-grade vs correctAnswer
router.post("/gradeManual", staff, gradeManual);        // rubric: per-question marks
>>>>>>> 378f46c862515ab3d7c8356f99efa49bf8fa34fa

module.exports = router;
