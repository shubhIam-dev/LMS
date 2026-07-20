// Notes controller — CRUD for course materials/resources.
const Notes = require("../models/Notes.model");

// GET /notes/getByCourse?courseId=...
// All notes for one course, newest first.
function getNotesByCourse(req, res) {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ msg: "courseId is required" });

    Notes.find({ courseId })
        .sort({ createdAt: -1 })
        .populate("uploadedBy", "name")
        .then((data) => res.json(data))
        .catch((err) => res.status(500).json({ msg: "Error fetching notes", error: err.message }));
}

// POST /notes/addNote
// Body: { title, description?, fileUrl?, courseId }
// Staff only (teacher / superadmin).
function addNote(req, res) {
    const { title, courseId } = req.body;
    if (!title || !courseId) return res.status(400).json({ msg: "title and courseId are required" });

    const note = new Notes({ ...req.body, uploadedBy: req.user?.id });
    note.save()
        .then(() => res.status(201).json({ msg: "Note added", note }))
        .catch((err) => res.status(500).json({ msg: "Error adding note", error: err.message }));
}

// POST /notes/deleteNote
// Body: { id }
function deleteNote(req, res) {
    const { id } = req.body;
    if (!id) return res.status(400).json({ msg: "id is required" });

    Notes.deleteOne({ _id: id })
        .then((data) => res.json({ msg: "Note deleted", data }))
        .catch((err) => res.status(500).json({ msg: "Error deleting note", error: err.message }));
}

module.exports = { getNotesByCourse, addNote, deleteNote };
