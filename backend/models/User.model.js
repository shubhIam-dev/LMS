// User — every account in the system. The `role` field decides what a user
// is allowed to do (see middleware/auth.js + AUTH.md for the permission matrix):
//   • student    — the default; views courses/assignments/marks, submits work
//   • teacher    — owns courses; creates questions, assignments, grades
//   • superadmin — full control; manages users and everything a teacher can do
//
// Passwords are hashed with bcrypt before saving (never stored in plain text).

let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');

let userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },

    role: {
        type: String,
        enum: ["student", "teacher", "superadmin"],
        default: "student"
    },

    // For students — which courses they are taking this term.
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
    }]
}, { timestamps: true });

// Hash the password before saving, but only if it changed (so re-saving a user
// for other reasons doesn't double-hash). This runs on .save() and .create().
// Async middleware simply returns/throws — no `next` needed in Mongoose.
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plain-text password against the stored hash.
userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

// Never leak the password hash in JSON responses.
userSchema.methods.toSafeJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model("User", userSchema);
