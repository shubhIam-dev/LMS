// seed.js — populate a fresh MongoDB (your own) with realistic demo data.
//
// Run once, right after you set MONGODB_URI in your .env:
//     npm run seed
//
// It wipes the six collections in your database, then inserts:
//   • 2 teachers, 3 students (login as any student with phone + password below)
//   • 4 courses (owned by the teachers; students enrolled)
//   • ~8 questions in the question bank
//   • 3 assignments (each references its course + a subset of questions)
//   • 1 submission for a student, already graded
//   • Marks rows so the Marks page has content
//
// Every relationship this file writes matches the diagram in DATABASE.md —
// read that side-by-side to see the schema come to life.

require("dotenv").config();
const mongoose = require("mongoose");

const User        = require("./models/User.model");
const Course      = require("./models/Courses.model");
const Question    = require("./models/Question.model");
const Assignment  = require("./models/assignments.model");
const Submission  = require("./models/Submission.model");
const Marks       = require("./models/Marks.model");
const Attendance  = require("./models/attendanceModel");
async function seed() {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("<user>")) {
        console.error("\n❌  MONGODB_URI is not set. Copy .env.example → .env and paste your URI first.\n");
        process.exit(1);
    }

    console.log("→ Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ Connected.\n");

    console.log("→ Clearing existing data in the six collections…");
    await Promise.all([
        User.deleteMany({}),
        Course.deleteMany({}),
        Question.deleteMany({}),
        Assignment.deleteMany({}),
        Submission.deleteMany({}),
        Marks.deleteMany({})
    ]);

    // ---------- 1. USERS ----------
    // Use User.create (NOT insertMany) so the pre-save hook hashes each password.
    console.log("→ Inserting users…");
    const [admin, rao, mehta, aria, bilal, chitra] = await User.create([
        { name: "Dr. Admin",   email: "admin@x.co", password: "admin", phoneNumber: 9000000000, role: "superadmin" },
        { name: "Prof. Rao",   email: "rao@x.co",   password: "teach", phoneNumber: 9000000001, role: "teacher" },
        { name: "Prof. Mehta", email: "mehta@x.co", password: "teach", phoneNumber: 9000000002, role: "teacher" },
        { name: "Aria",   email: "aria@x.co",   password: "demo", phoneNumber: 9999999001, role: "student" },
        { name: "Bilal",  email: "bilal@x.co",  password: "demo", phoneNumber: 9999999002, role: "student" },
        { name: "Chitra", email: "chitra@x.co", password: "demo", phoneNumber: 9999999003, role: "student" }
    ]);
    void admin;

    // ---------- 2. COURSES ----------
    console.log("→ Inserting courses…");
    const [dsa, dbms, os, ml] = await Course.insertMany([
        { CourseName: "Data Structures & Algorithms", CourseCode: "CS201", description: "Arrays, trees, graphs, dynamic programming.", credits: 4, semester: "Fall 2026", instructor: rao._id,   enrolledStudents: [aria._id, bilal._id, chitra._id] },
        { CourseName: "Database Management Systems",  CourseCode: "CS304", description: "Relational model, SQL, indexes, transactions.", credits: 3, semester: "Fall 2026", instructor: mehta._id, enrolledStudents: [aria._id, bilal._id] },
        { CourseName: "Operating Systems",            CourseCode: "CS305", description: "Processes, scheduling, memory, filesystems.",   credits: 3, semester: "Fall 2026", instructor: rao._id,   enrolledStudents: [bilal._id, chitra._id] },
        { CourseName: "Machine Learning Foundations", CourseCode: "CS410", description: "Linear models, trees, evaluation.",              credits: 4, semester: "Spring 2027", instructor: mehta._id, enrolledStudents: [aria._id, chitra._id] }
    ]);

    // Reflect enrollment back on students (many-to-many, both sides).
    await User.updateOne({ _id: aria._id },   { enrolledCourses: [dsa._id, dbms._id, ml._id] });
    await User.updateOne({ _id: bilal._id },  { enrolledCourses: [dsa._id, dbms._id, os._id] });
    await User.updateOne({ _id: chitra._id }, { enrolledCourses: [dsa._id, os._id, ml._id] });

    // ---------- 3. QUESTIONS ----------
    console.log("→ Inserting question bank…");
    const [q1, q2, q3, q4, q5, q6, q7, q8] = await Question.insertMany([
        { text: "Time complexity of binary search?", questionType: "mcq", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: "O(log n)", marks: 2, topic: "Complexity", difficulty: "easy" },
        { text: "Which data structure uses LIFO order?", questionType: "mcq", options: ["Queue", "Stack", "Heap", "Trie"], correctAnswer: "Stack", marks: 2, topic: "DS Basics", difficulty: "easy" },
        { text: "Explain the difference between BFS and DFS.", questionType: "long", correctAnswer: "", marks: 5, topic: "Graph traversal", difficulty: "medium" },
        { text: "Normalize the following relation to 3NF.", questionType: "long", correctAnswer: "", marks: 8, topic: "Normalization", difficulty: "hard" },
        { text: "SQL keyword to remove duplicate rows in a result?", questionType: "mcq", options: ["UNIQUE", "DISTINCT", "DEDUPE", "ONLY"], correctAnswer: "DISTINCT", marks: 1, topic: "SQL", difficulty: "easy" },
        { text: "The kernel handles system calls.", questionType: "truefalse", options: ["true", "false"], correctAnswer: "true", marks: 1, topic: "OS Basics", difficulty: "easy" },
        { text: "Name a page replacement algorithm.", questionType: "short", correctAnswer: "LRU", marks: 2, topic: "Memory", difficulty: "medium" },
        { text: "Write a function that returns the mean of an array.", questionType: "code", correctAnswer: "", marks: 4, topic: "Programming", difficulty: "easy" }
    ]);

    // ---------- 4. ASSIGNMENTS ----------
    console.log("→ Inserting assignments…");
    const [dsaHw, dbmsHw, osQuiz] = await Assignment.insertMany([
        { assignmentName: "Week 1 — Complexity & Basics", assignmentType: "Homework", assignmentTopics: ["Complexity", "DS Basics", "Traversal"], courseId: dsa._id, questions: [q1._id, q2._id, q3._id], totalMarks: q1.marks + q2.marks + q3.marks, dueOn: new Date(Date.now() + 14 * 24 * 3600 * 1000) },
        { assignmentName: "Normalization Practice",        assignmentType: "Project",  assignmentTopics: ["Normalization", "SQL"],               courseId: dbms._id, questions: [q4._id, q5._id],       totalMarks: q4.marks + q5.marks,             dueOn: new Date(Date.now() + 21 * 24 * 3600 * 1000) },
        { assignmentName: "Weekly Quiz — Memory & Kernel", assignmentType: "Quiz",     assignmentTopics: ["OS Basics", "Memory"],                courseId: os._id,   questions: [q6._id, q7._id],       totalMarks: q6.marks + q7.marks,             dueOn: new Date(Date.now() + 7  * 24 * 3600 * 1000) }
    ]);

    // ---------- 5. A GRADED SUBMISSION ----------
    console.log("→ Inserting a graded submission for Aria on the DSA homework…");
    const submission = await Submission.create({
        assignmentId: dsaHw._id,
        studentId:    aria._id,
        answers: [
            { questionId: q1._id, answer: "O(log n)" },
            { questionId: q2._id, answer: "Stack" },
            { questionId: q3._id, answer: "BFS uses a queue and explores level by level; DFS uses a stack (or recursion) and explores as deep as possible first." }
        ],
        status:       "graded",
        marksAwarded: q1.marks + q2.marks    // long-answer q3 auto-graded to 0
    });

    // ---------- 6. MARKS ROWS ----------
    console.log("→ Inserting marks rows…");
    await Marks.insertMany([
        { studentId: aria._id,   courseId: dsa._id,  courseName: dsa.CourseName,  marksObtained: 82, totalMarks: 100, examType: "Midterm",    semester: "Fall 2026"  },
        { studentId: aria._id,   courseId: dbms._id, courseName: dbms.CourseName, marksObtained: 14, totalMarks: 20,  examType: "Quiz",       semester: "Fall 2026"  },
        { studentId: aria._id,   courseId: dsa._id,  courseName: dsa.CourseName,  marksObtained: submission.marksAwarded, totalMarks: dsaHw.totalMarks, examType: "Assignment", semester: "Fall 2026" },
        { studentId: bilal._id,  courseId: os._id,   courseName: os.CourseName,   marksObtained: 71, totalMarks: 100, examType: "Final",      semester: "Fall 2026"  },
        { studentId: chitra._id, courseId: ml._id,   courseName: ml.CourseName,   marksObtained: 58, totalMarks: 100, examType: "Midterm",    semester: "Spring 2027" }
    ]);

    console.log("\n✅ Seed complete. Log in on the frontend with any of these:\n");
    console.log("   ROLE         PHONE         PASSWORD");
    console.log("   superadmin   9000000000    admin");
    console.log("   teacher      9000000001    teach     (Prof. Rao)");
    console.log("   teacher      9000000002    teach     (Prof. Mehta)");
    console.log("   student      9999999001    demo      (Aria)");
    console.log("   student      9999999002    demo      (Bilal)");
    console.log("   student      9999999003    demo      (Chitra)\n");

    await mongoose.disconnect();
}

seed().catch(async (err) => {
    console.error("\n❌ Seed failed:", err.message);
    console.error(err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
