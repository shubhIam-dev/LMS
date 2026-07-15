let express = require("express");
let {
    submitAssignment,
    getSubmissionsByStudent,
    getSubmissionsByAssignment,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
    gradeSubmission
} = require("../controllers/submissionController.js");

const router = express.Router();

router.post("/submit",              submitAssignment);
router.get("/getByStudent",         getSubmissionsByStudent);
router.get("/getByAssignment",      getSubmissionsByAssignment);
router.post("/grade",               gradeSubmission);
<<<<<<< HEAD
=======
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
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232

module.exports = router;
