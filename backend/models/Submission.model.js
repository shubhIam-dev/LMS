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

    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },
        answer: { type: String, default: "" },
        awarded: { type: Number, default: 0 }
    }],

    submittedOn: { type: Date, default: Date.now },

    status: {
        type: String,
        enum: ["submitted", "graded"],
        default: "submitted"
    },

    marksAwarded: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
