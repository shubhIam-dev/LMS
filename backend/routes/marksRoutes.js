let express = require("express");
let { addMarks, getMarksByStudent, getAllMarks } = require("../controllers/marksController.js");
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// A signed-in user can view marks (a student sees their own grade sheet).
router.get("/getMarksByStudent", authenticate, getMarksByStudent);

// Recording marks directly, and viewing the whole grade book, are staff only.
const staff = [authenticate, authorize("teacher", "superadmin")];
router.post("/addMarks", staff, addMarks);
router.get("/getAllMarks", staff, getAllMarks);

module.exports = router;
