// Submission — one student's attempt at one assignment.
//
// Answers are stored inline (embedded) — each entry pairs a Question
// reference with the raw text the student wrote. We keep them embedded
// because an answer only makes sense in the context of the submission
// that owns it, and there's no need to query answers on their own.

let mongoose = require("mongoose");

let submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "asignments",
        required: true
    },

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // What the student actually wrote, question by question.
    // `awarded` is filled in when a teacher grades manually (rubric-style,
    // per-question marks) or by the auto-grader.
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },
        answer:  { type: String, default: "" },
        awarded: { type: Number, default: 0 }
    }],

    submittedOn: { type: Date, default: Date.now },

    status: {
        type: String,
        enum: ["submitted", "graded"],
        default: "submitted"
    },

    // Filled in by the grader (auto-grade or manual).
    marksAwarded: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
