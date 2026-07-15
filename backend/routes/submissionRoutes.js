let express = require("express");
let {
    submitAssignment,
    getSubmissionsByStudent,
    getSubmissionsByAssignment,
    gradeSubmission
} = require("../controllers/submissionController.js");

const router = express.Router();

router.post("/submit",              submitAssignment);
router.get("/getByStudent",         getSubmissionsByStudent);
router.get("/getByAssignment",      getSubmissionsByAssignment);
router.post("/grade",               gradeSubmission);

module.exports = router;
