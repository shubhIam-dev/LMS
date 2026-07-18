let express = require("express");
let { getStudentDashboard } = require("../controllers/dashboardControllers");
let { authenticate } = require("../middleware/auth");

const router = express.Router();

// Any signed-in user (student) can fetch their own dashboard.
router.get("/student", authenticate, getStudentDashboard);

module.exports = router;
