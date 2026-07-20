let express = require("express");
let { getNotesByCourse, addNote, deleteNote } = require("../controllers/notesController");
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Any signed-in user can view notes.
router.get("/getByCourse", authenticate, getNotesByCourse);

// Staff only can add / delete.
const staff = [authenticate, authorize("teacher", "superadmin")];
router.post("/addNote", staff, addNote);
router.post("/deleteNote", staff, deleteNote);

module.exports = router;
