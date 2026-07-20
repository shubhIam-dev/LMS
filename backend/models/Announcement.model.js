// Announcement — teacher posts updates / notices for a course.
// Displayed on the CourseDetail page for enrolled students.

let mongoose = require("mongoose");

let announcementSchema = new mongoose.Schema({
    text:     { type: String, required: true },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
