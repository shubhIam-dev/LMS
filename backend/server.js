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

// Connect to MongoDB using the MONGODB_URI from .env file
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected TO DataBase"))
    .catch(() => console.log("❌ Error While Connection"));

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