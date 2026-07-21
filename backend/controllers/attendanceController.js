const Attendance = require("../models/attendanceModel");
const Course = require("../models/Courses.model");
const User = require("../models/User.model");
// POST /attendance/addAttendance
// POST /attendance/addAttendance
const addAttendance = async (req, res) => {
    try {
        const {
            courseId,
            teacherId,
            attendanceDate,
            attendanceRecords
        } = req.body;
          if (!courseId || !teacherId || !attendanceDate || !attendanceRecords) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }
        const alreadyExists = await Attendance.findOne({
            courseId,
            attendanceDate
        });
        if (alreadyExists) {
            return res.status(400).json({
                message: "Attendance already exists for this date."
            });
        }
        const editableUntil = new Date(attendanceDate);
        editableUntil.setDate(editableUntil.getDate() + 2);
        
        const recordsWithNames = await Promise.all(
    attendanceRecords.map(async (record) => {
        const student = await User.findById(record.studentId);
        if (!student) {
            throw new Error(`Student not found: ${record.studentId}`);
        }
        return {
            studentId: record.studentId,
            studentName: student.name,
            status: record.status
        };
    })
);

const attendance = await Attendance.create({
    courseId,
    courseName: course.CourseName,
    teacherId,
    attendanceDate,
    editableUntil,
    attendanceRecords: recordsWithNames
});
        res.status(201).json({
            success: true,
            attendance
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
const getAttendanceByCourse = async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) {
    return res.status(400).json({
        success: false,
        message: "Course ID is required."
    });
}
        const attendance = await Attendance.find({
    courseId
})
.populate("teacherId", "name email")
.sort({
    attendanceDate: -1
});
    res.status(200).json({
    success: true,
    attendance
});
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
const getAttendanceById = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
    return res.status(400).json({
        success: false,
        message: "Attendance ID is required."
    });
}
        const attendance = await Attendance.findById(id)
            .populate("attendanceRecords.studentId", "name email")
            .populate("teacherId", "name email");
        if (!attendance) {
            return res.status(404).json({
                message: "Attendance not found"
            });
        }
  res.status(200).json({
    success: true,
    attendance
});
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const {
            attendanceId,
            attendanceRecords
        } = req.body;
        if (!attendanceId || !attendanceRecords) {
    return res.status(400).json({
        success: false,
        message: "Missing required fields."
    });
}
        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({
                message: "Attendance not found"
            });
        }
        if (new Date() > attendance.editableUntil) {
            return res.status(400).json({
                message: "Attendance is locked."
            });
        }
       const recordsWithNames = await Promise.all(
    attendanceRecords.map(async (record) => {
        const student = await User.findById(record.studentId);
         if (!student) {
            throw new Error(`Student not found: ${record.studentId}`);
        }
        return {
            studentId: record.studentId,
            studentName: student.name,
            status: record.status
        };
    })
);

attendance.attendanceRecords = recordsWithNames;
        await attendance.save();
        res.json({
            success: true,
            attendance
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
const getCourseStudents = async (req, res) => {
    try {

        const { courseId } = req.query;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required."
            });
        }

        const course = await Course.findById(courseId)
            .populate(
                "enrolledStudents",
                "name email phoneNumber role"
            );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        res.status(200).json({
            success: true,
            courseName: course.CourseName,
            courseCode: course.CourseCode,
            students: course.enrolledStudents
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};
const getStudentAttendance = async (req, res) => {
    try {

        const { studentId } = req.query;
        if (!studentId) {
    return res.status(400).json({
        success: false,
        message: "Student ID is required."
    });
}
        const attendance = await Attendance.find({
            editableUntil: {
                $lte: new Date()
            },
            "attendanceRecords.studentId": studentId
        });

        const result = attendance
            .map(record => {

                const student = record.attendanceRecords.find(
                    r => r.studentId.toString() === studentId.toString()
                );

                if (!student) return null;

                return {
                    courseId: record.courseId,
                    courseName: record.courseName,
                    attendanceDate: record.attendanceDate,
                    status: student.status
                };

            })
            .filter(Boolean);

       res.status(200).json({
    success: true,
    attendance: result
});

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};

module.exports = {
    addAttendance,
    getAttendanceByCourse,
    getAttendanceById,
    updateAttendance,
    getStudentAttendance,
    getCourseStudents
};