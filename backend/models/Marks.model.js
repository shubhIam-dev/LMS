let mongoose = require("mongoose");

let marksSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    marksObtained: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true,
        default: 100
    },
    examType: {
        type: String,
        enum: ["Midterm", "Final", "Quiz", "Assignment"],
        required: true
    },
    semester: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Marks", marksSchema);
