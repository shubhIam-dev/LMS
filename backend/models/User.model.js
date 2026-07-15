let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },

    role: {
        type: String,
        enum: ["student", "faculty"],
        default: "student"
    },

    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
    }]
}, { timestamps: true });

userSchema.methods.toSafeJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model("User", userSchema);
