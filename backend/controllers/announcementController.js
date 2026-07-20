// Announcement controller — CRUD for course announcements.
const Announcement = require("../models/Announcement.model");

// GET /announcements/getByCourse?courseId=...
// All announcements for one course, newest first.
function getAnnouncementsByCourse(req, res) {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ msg: "courseId is required" });

    Announcement.find({ courseId })
        .sort({ createdAt: -1 })
        .populate("createdBy", "name")
        .then((data) => res.json(data))
        .catch((err) => res.status(500).json({ msg: "Error fetching announcements", error: err.message }));
}

// POST /announcements/addAnnouncement
// Body: { text, courseId }
// Staff only.
function addAnnouncement(req, res) {
    const { text, courseId } = req.body;
    if (!text || !courseId) return res.status(400).json({ msg: "text and courseId are required" });

    const announcement = new Announcement({ text, courseId, createdBy: req.user?.id });
    announcement.save()
        .then(() => res.status(201).json({ msg: "Announcement added", announcement }))
        .catch((err) => res.status(500).json({ msg: "Error adding announcement", error: err.message }));
}

// POST /announcements/deleteAnnouncement
// Body: { id }
function deleteAnnouncement(req, res) {
    const { id } = req.body;
    if (!id) return res.status(400).json({ msg: "id is required" });

    Announcement.deleteOne({ _id: id })
        .then((data) => res.json({ msg: "Announcement deleted", data }))
        .catch((err) => res.status(500).json({ msg: "Error deleting announcement", error: err.message }));
}

module.exports = { getAnnouncementsByCourse, addAnnouncement, deleteAnnouncement };
