let express = require('express');
let app = express();
let mongoose = require("mongoose");
let cors = require('cors');
let path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// Import routes
let userRoutes = require('./routes/userRoutes');
let courseRoutes = require('./routes/courseRoutes.js');
let assignmentsRoutes = require('./routes/assignmentsRoutes.js');
let marksRoutes = require('./routes/marksRoutes.js');
let questionRoutes = require('./routes/questionRoutes.js');
let submissionRoutes = require('./routes/submissionRoutes.js');
let dashboardRoutes = require('./routes/dashboardRoutes.js');
let facultyDashboardRoutes = require('./routes/facultyDashboardRoutes.js');
let profileRoutes = require('./routes/profileRoutes.js');
let notesRoutes = require('./routes/notesRoutes.js');
let announcementRoutes = require('./routes/announcementRoutes.js');
let attendancRoutes = require('./routes/attendanceRoutes.js');
let adminDashboardRoutes=require('./routes/adminDashboardRoutes.js')
// Global error handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error(' Uncaught Exception:', err.message);
    console.error(err.stack);
});
process.on('unhandledRejection', (err) => {
    console.error(' Unhandled Rejection:', err.message || err);
    console.error(err?.stack || '');
});

// Fail fast if the URI is missing or still on its placeholder — otherwise
// mongoose.connect(undefined) throws a scary stack trace that hides the
// real problem (which is: you didn't set up your .env yet).
if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("<user>") || process.env.MONGODB_URI.includes("<username>")) {
    console.error("\n❌  MONGODB_URI is not set.\n");
    console.error("    Fix it in three steps:");
    console.error("      1) cp .env.example .env");
    console.error("      2) Open .env and paste your MongoDB connection string.");
    console.error("      3) Save, then re-run  npm start\n");
    console.error("    Need a database? See README.md → \"Step 1 — Set up MongoDB\"\n");
    process.exit(1);
}

// Connect to MongoDB using the MONGODB_URI from .env file
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds if can't connect
    connectTimeoutMS: 10000,
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("\n❌  Could not connect to MongoDB:");
        console.error("    " + err.message);
        console.error("\n    Common fixes:");
        console.error("      • Password URL-encoded? (@ → %40, # → %23)");
        console.error("      • IP whitelisted in Atlas → Network Access?");
        console.error("      • Username + password correct?");
        console.error("      • Cluster still provisioning? Wait ~2 min and retry.\n");
    });

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());

// Routes
app.use('/course', courseRoutes);
app.use('/user', userRoutes);
app.use('/assignments', assignmentsRoutes);
app.use('/marks', marksRoutes);
app.use('/questions', questionRoutes);
app.use('/submissions', submissionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/dashboard/faculty', facultyDashboardRoutes);
app.use('/faculty', facultyDashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/notes', notesRoutes);
app.use('/announcements', announcementRoutes);
app.use('/attendance',attendancRoutes)
app.use('/dashboard/admin',adminDashboardRoutes)
app.get('/', (req, res) => {
    res.send('🎓 College ERP Backend is working!');
});

app.listen(process.env.PORT || 9000, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 9000}`);
});