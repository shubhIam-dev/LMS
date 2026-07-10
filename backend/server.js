let express = require('express');
let app = express();
let mongoose = require("mongoose");
let cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Import routes
let userRoutes = require('./routes/userRoutes');
let courseRoutes = require('./routes/courseRoutes.js');
let assignmentsRoutes = require('./routes/assignmentsRoutes.js');
let marksRoutes = require('./routes/marksRoutes.js');

// Global error handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error(' Uncaught Exception:', err.message);
    console.error(err.stack);
});
process.on('unhandledRejection', (err) => {
    console.error(' Unhandled Rejection:', err.message || err);
    console.error(err?.stack || '');
});

// Connect to MongoDB using the MONGODB_URI from .env file
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds if can't connect
    connectTimeoutMS: 10000,
})
    .then(() => console.log(" Connected TO DataBase"))
    .catch((err) => {
        console.log("Error While Connection: " + err.message);
        console.error(err);
    });

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());

// Routes
app.use('/course', courseRoutes);
app.use('/user', userRoutes);
app.use('/assignments', assignmentsRoutes);
app.use('/marks', marksRoutes);

app.get('/', (req, res) => {
    res.send('🎓 College ERP Backend is working!');
});

app.listen(process.env.PORT || 9000, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 9000}`);
});