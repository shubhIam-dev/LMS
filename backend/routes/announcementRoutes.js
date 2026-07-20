let express = require("express");
let { getAnnouncementsByCourse, addAnnouncement, deleteAnnouncement } = require("../controllers/announcementController");
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Any signed-in user can view announcements.
router.get("/getByCourse", authenticate, getAnnouncementsByCourse);

// Staff only can add / delete.
const staff = [authenticate, authorize("teacher", "superadmin")];
router.post("/addAnnouncement", staff, addAnnouncement);
router.post("/deleteAnnouncement", staff, deleteAnnouncement);

module.exports = router;
