const Marks = require("../models/Marks.model.js");

function addMarks(req, res) {
    const { studentId, courseId, courseName, marksObtained, totalMarks, examType, semester } = req.body;

    if (!studentId || !courseId || !courseName || marksObtained === undefined || !examType || !semester) {
        return res.status(400).json({ msg: "All fields are required" });
    }

    let newMarks = new Marks({
        studentId,
        courseId,
        courseName,
        marksObtained,
        totalMarks: totalMarks || 100,
        examType,
        semester
    });

    newMarks.save()
        .then(() => {
            res.json({ msg: "Marks added successfully", marks: newMarks });
        })
        .catch((err) => {
            res.status(500).json({ msg: "Error adding marks", error: err });
        });
}

function getMarksByStudent(req, res) {
    const { studentId } = req.query;

    Marks.find({ studentId })
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ msg: "Error fetching marks", error: err });
        });
}

function getAllMarks(req, res) {
    Marks.find()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ msg: "Error fetching marks", error: err });
        });
}

module.exports = { addMarks, getMarksByStudent, getAllMarks };
