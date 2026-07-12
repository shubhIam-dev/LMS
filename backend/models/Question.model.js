// Question — one atomic question. Assignments are just lists of Question refs.
//
// Why a separate collection instead of embedding questions inside an
// Assignment document?
//   • Questions can be reused across assignments/quizzes.
//   • Grading logic reads a question's `correctAnswer` independently of any
//     particular assignment.
//   • Documents stay small — an Assignment with 40 questions is a small
//     array of ObjectIds instead of 40 embedded question objects.

let mongoose = require("mongoose");

let questionSchema = new mongoose.Schema({
    text: { type: String, required: true },

    // What kind of question is this? The frontend can render each type
    // differently (MCQ options, short-answer textbox, code editor, …).
    questionType: {
        type: String,
        enum: ["mcq", "short", "long", "code", "truefalse"],
        default: "short"
    },

    // Only used when questionType === "mcq".
    options: [{ type: String }],

    // The expected answer. Used later by an auto-grading endpoint that
    // compares a Submission's answer to this value.
    correctAnswer: { type: String, default: "" },

    marks:      { type: Number, default: 1 },
    topic:      { type: String, default: "" },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
