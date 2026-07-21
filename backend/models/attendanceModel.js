let mongoose = require("mongoose")
const attendanceSchema = new mongoose.Schema({
    courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "courses",
    required: true
},
 courseName: {
    type: String,
    required: true
},
 attendanceDate: {
    type: Date,
    required: true
},
 editableUntil: {
    type: Date,
    required: true
},
 teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
attendanceRecords: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            studentName: {
            type: String,
            required: true
        },
            status: {
                type: String,
                enum: ["Present", "Absent"],
                required: true
            }
        }
    ]
}, {
    timestamps: true
});
attendanceSchema.index(
    { courseId: 1, attendanceDate: 1 },
    { unique: true }
);
module.exports = mongoose.model("Attendance", attendanceSchema)
