// Score Routes — wire up the Score controller with authentication.
// Students can view their own scores; staff can manage all scores.

let express = require("express");
let {
    getScoreByStudent,
    getScoreByCourse,
    createScore,
    updateScore,
    updateComponent,
    deleteScore
} = require("../controllers/scoreController.js");
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// ── Read ─────────────────────────────────────────────────────────
// Any signed-in user can view scores.
router.get("/getByStudent", authenticate, getScoreByStudent);
router.get("/getByCourse",  authenticate, getScoreByCourse);

// ── Write (staff only) ───────────────────────────────────────────
const staff = [authenticate, authorize("teacher", "superadmin")];
router.post("/create",          staff, createScore);
router.put("/update",           staff, updateScore);
router.put("/updateComponent",  staff, updateComponent);
router.delete("/delete",        staff, deleteScore);

module.exports = router;
