// Course — one subject/paper. Owned by a teacher, taken by many students.
// Assignments and marks refer back here via `courseId`.

let mongoose = require("mongoose")

let coursesSchema = new mongoose.Schema({
    CourseName: { type: String, required: true },
    CourseCode: { type: String, required: true },

    description: { type: String, default: "" },
    credits:     { type: Number, default: 3 },
    semester:    { type: String, default: "" },

    // The teacher who owns this course. Points at the User collection —
    // only Users with role === "teacher" should be used here (the model
    // does not enforce that; controllers can validate before setting).
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // Students taking this course this term.
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

module.exports = mongoose.model("courses", coursesSchema)
