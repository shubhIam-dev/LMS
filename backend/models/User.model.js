// User — students and teachers both live here (differentiated by `role`).
// A student can be enrolled in many courses (enrolledCourses is an array of
// references into the courses collection).
//
// 💡 This model handles LOGIN/AUTH only. The detailed profile information
//    (address, guardian, faculty qualifications, etc.) lives in the
//    SEPARATE Profile model (see Profile.model.js).

let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },

    role: {
        type: String,
        enum: ["student", "teacher"],
        default: "student"
    },

    // For students — which courses they are taking this term.
    // Each entry is an ObjectId that points at a document in the `courses` collection.
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
    }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
