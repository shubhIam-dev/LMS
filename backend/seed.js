require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User.model");
const Course = require("./models/Courses.model");
const Question = require("./models/Question.model");
const Assignment = require("./models/assignments.model");
const Submission = require("./models/Submission.model");
const Marks = require("./models/Marks.model");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.includes("<user>")) {
    console.error("\n❌ MONGODB_URI is not set. Copy .env.example → .env and paste your URI first.\n");
    process.exit(1);
}

console.log("→ Connecting to MongoDB…");
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
        console.log("✅ Connected.\n");
        console.log("→ Clearing existing data…");
        return Promise.all([
            User.deleteMany({}),
            Course.deleteMany({}),
            Question.deleteMany({}),
            Assignment.deleteMany({}),
            Submission.deleteMany({}),
            Marks.deleteMany({})
        ]);
    })
    .then(() => {
        console.log("→ Inserting users…");
        return User.create([
            { name: "Prof. Rao", email: "rao@x.co", password: "teach", phoneNumber: 9000000001, role: "faculty" },
            { name: "Prof. Mehta", email: "mehta@x.co", password: "teach", phoneNumber: 9000000002, role: "faculty" },
            { name: "Aria", email: "aria@x.co", password: "demo", phoneNumber: 9999999001, role: "student" },
            { name: "Bilal", email: "bilal@x.co", password: "demo", phoneNumber: 9999999002, role: "student" },
            { name: "Chitra", email: "chitra@x.co", password: "demo", phoneNumber: 9999999003, role: "student" }
        ]);
    })
    .then(users => {
        const [rao, mehta, aria, bilal, chitra] = users;
        console.log("→ Inserting courses…");
        return Course.insertMany([
            { CourseName: "Data Structures & Algorithms", CourseCode: "CS201", description: "Arrays, trees, graphs, dynamic programming.", credits: 4, semester: "Fall 2026", instructor: rao._id, enrolledStudents: [aria._id, bilal._id, chitra._id] },
            { CourseName: "Database Management Systems", CourseCode: "CS304", description: "Relational model, SQL, indexes, transactions.", credits: 3, semester: "Fall 2026", instructor: mehta._id, enrolledStudents: [aria._id, bilal._id] },
            { CourseName: "Operating Systems", CourseCode: "CS305", description: "Processes, scheduling, memory, filesystems.", credits: 3, semester: "Fall 2026", instructor: rao._id, enrolledStudents: [bilal._id, chitra._id] },
            { CourseName: "Machine Learning Foundations", CourseCode: "CS410", description: "Linear models, trees, evaluation.", credits: 4, semester: "Spring 2027", instructor: mehta._id, enrolledStudents: [aria._id, chitra._id] }
        ]).then(courses => {
            const [dsa, dbms, os, ml] = courses;
            console.log("→ Enrolling students…");
            return Promise.all([
                User.updateOne({ _id: aria._id }, { enrolledCourses: [dsa._id, dbms._id, ml._id] }),
                User.updateOne({ _id: bilal._id }, { enrolledCourses: [dsa._id, dbms._id, os._id] }),
                User.updateOne({ _id: chitra._id }, { enrolledCourses: [dsa._id, os._id, ml._id] })
            ]).then(() => ({ rao, mehta, aria, bilal, chitra, dsa, dbms, os, ml }));
        });
    })
    .then(ctx => {
        console.log("→ Inserting question bank…");
        return Question.insertMany([
            { text: "Time complexity of binary search?", questionType: "mcq", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: "O(log n)", marks: 2, topic: "Complexity", difficulty: "easy" },
            { text: "Which data structure uses LIFO order?", questionType: "mcq", options: ["Queue", "Stack", "Heap", "Trie"], correctAnswer: "Stack", marks: 2, topic: "DS Basics", difficulty: "easy" },
            { text: "Explain the difference between BFS and DFS.", questionType: "long", correctAnswer: "", marks: 5, topic: "Graph traversal", difficulty: "medium" },
            { text: "Normalize the following relation to 3NF.", questionType: "long", correctAnswer: "", marks: 8, topic: "Normalization", difficulty: "hard" },
            { text: "SQL keyword to remove duplicate rows in a result?", questionType: "mcq", options: ["UNIQUE", "DISTINCT", "DEDUPE", "ONLY"], correctAnswer: "DISTINCT", marks: 1, topic: "SQL", difficulty: "easy" },
            { text: "The kernel handles system calls.", questionType: "truefalse", options: ["true", "false"], correctAnswer: "true", marks: 1, topic: "OS Basics", difficulty: "easy" },
            { text: "Name a page replacement algorithm.", questionType: "short", correctAnswer: "LRU", marks: 2, topic: "Memory", difficulty: "medium" },
            { text: "Write a function that returns the mean of an array.", questionType: "code", correctAnswer: "", marks: 4, topic: "Programming", difficulty: "easy" }
        ]).then(questions => {
            const [q1, q2, q3, q4, q5, q6, q7, q8] = questions;
            console.log("→ Inserting assignments…");
            return Assignment.insertMany([
                { assignmentName: "Week 1 — Complexity & Basics", assignmentType: "Homework", assignmentTopics: ["Complexity", "DS Basics", "Traversal"], courseId: ctx.dsa._id, questions: [q1._id, q2._id, q3._id], totalMarks: q1.marks + q2.marks + q3.marks, dueOn: new Date(Date.now() + 14 * 24 * 3600 * 1000) },
                { assignmentName: "Normalization Practice", assignmentType: "Project", assignmentTopics: ["Normalization", "SQL"], courseId: ctx.dbms._id, questions: [q4._id, q5._id], totalMarks: q4.marks + q5.marks, dueOn: new Date(Date.now() + 21 * 24 * 3600 * 1000) },
                { assignmentName: "Weekly Quiz — Memory & Kernel", assignmentType: "Quiz", assignmentTopics: ["OS Basics", "Memory"], courseId: ctx.os._id, questions: [q6._id, q7._id], totalMarks: q6.marks + q7.marks, dueOn: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
            ]).then(assignments => {
                const [dsaHw, dbmsHw, osQuiz] = assignments;
                console.log("→ Inserting a graded submission for Aria on the DSA homework…");
                return Submission.create({
                    assignmentId: dsaHw._id,
                    studentId: ctx.aria._id,
                    answers: [
                        { questionId: q1._id, answer: "O(log n)" },
                        { questionId: q2._id, answer: "Stack" },
                        { questionId: q3._id, answer: "BFS uses a queue and explores level by level; DFS uses a stack (or recursion) and explores as deep as possible first." }
                    ],
                    status: "graded",
                    marksAwarded: q1.marks + q2.marks
                }).then(submission => {
                    console.log("→ Inserting marks rows…");
                    return Marks.insertMany([
                        { studentId: ctx.aria._id, courseId: ctx.dsa._id, courseName: ctx.dsa.CourseName, marksObtained: 82, totalMarks: 100, examType: "Midterm", semester: "Fall 2026" },
                        { studentId: ctx.aria._id, courseId: ctx.dbms._id, courseName: ctx.dbms.CourseName, marksObtained: 14, totalMarks: 20, examType: "Quiz", semester: "Fall 2026" },
                        { studentId: ctx.aria._id, courseId: ctx.dsa._id, courseName: ctx.dsa.CourseName, marksObtained: submission.marksAwarded, totalMarks: dsaHw.totalMarks, examType: "Assignment", semester: "Fall 2026" },
                        { studentId: ctx.bilal._id, courseId: ctx.os._id, courseName: ctx.os.CourseName, marksObtained: 71, totalMarks: 100, examType: "Final", semester: "Fall 2026" },
                        { studentId: ctx.chitra._id, courseId: ctx.ml._id, courseName: ctx.ml.CourseName, marksObtained: 58, totalMarks: 100, examType: "Midterm", semester: "Spring 2027" }
                    ]);
                });
            });
        });
    })
    .then(() => {
        console.log("\n✅ Seed complete. Log in with any of these:\n");
        console.log("   ROLE         PHONE         PASSWORD");
        console.log("   faculty      9000000001    teach     (Prof. Rao)");
        console.log("   faculty      9000000002    teach     (Prof. Mehta)");
        console.log("   student      9999999001    demo      (Aria)");
        console.log("   student      9999999002    demo      (Bilal)");
        console.log("   student      9999999003    demo      (Chitra)\n");
        return mongoose.disconnect();
    })
    .catch(err => {
        console.error("\n❌ Seed failed:", err.message);
        console.error(err);
        mongoose.disconnect().catch(() => {});
        process.exit(1);
    });
