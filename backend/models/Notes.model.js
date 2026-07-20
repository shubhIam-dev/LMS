// Notes — course materials / resources uploaded by a teacher.
// Each note belongs to a course and has a title + optional description + file URL.

let mongoose = require("mongoose");

let notesSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, default: "" },

    // URL to the uploaded file (PDF, image, etc.) — stored as a string.
    // The actual file upload is handled separately (e.g., multer → local / cloud).
    fileUrl:     { type: String, default: "" },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("Notes", notesSchema);
