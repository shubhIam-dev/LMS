let express = require("express");
let { addUser, getUser, addUsers, getStudents } = require("../controllers/users.controllers");
let { register, login, me, adminCreateUser } = require("../controllers/authController");
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// ---- Public auth endpoints ----
router.post('/register', register);   // self-signup (always creates a student)
router.post('/login', login);         // returns a JWT

// ---- Authenticated ----
router.get('/me', authenticate, me);  // current user from the token

// ---- Superadmin only ----
// Minting teachers / superadmins, and bulk inserts, are privileged actions.
router.post('/adminCreateUser', authenticate, authorize("superadmin"), adminCreateUser);
router.post('/addUsers', authenticate, authorize("superadmin"), addUsers);

// ---- Staff (teacher/superadmin) ----
router.get('/students', authenticate, authorize("teacher", "superadmin"), getStudents);

// ---- Legacy (kept for backwards-compat with older docs/scripts) ----
router.post('/addUser', addUser);
router.get('/getUser', getUser);

module.exports = router;
