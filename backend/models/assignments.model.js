// Assignment — a set of questions attached to a specific course.
//
// An assignment does NOT embed questions. It stores an array of Question
// ObjectIds (references into the questions collection). To fetch an
// assignment with its questions filled in, use Mongoose's .populate():
//     Assignment.findById(id).populate('questions').populate('courseId')

let mongoose = require("mongoose")

let assignmentSchema = new mongoose.Schema({
    assignmentName:   { type: String, required: true },
    assignmentType:   { type: String, default: "Homework" },
    assignmentTopics: [{ type: String }],

    // Which course does this assignment belong to?
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true
    },

    // Ordered list of Question refs — position in the array is the
    // question number the student sees.
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }],

    // Denormalized total — populated by the controller when the
    // assignment is created, so we don't have to sum question marks
    // on every read.
    totalMarks: { type: Number, default: 0 },

    createdOn: { type: Date, default: Date.now },
    dueOn:     { type: Date },

    // Which teacher created this assignment. Other teachers can REUSE it —
    // cloning it into their own course via /assignments/reuse.
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("asignments", assignmentSchema)
