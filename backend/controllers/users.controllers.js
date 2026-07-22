const User = require("../models/User.model")

async function addUser(req, res) {
    try {
        const { name, email, password, phoneNumber } = req.body

        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ msg: "All fields are required" })
        }

        // Pass the whole body through so optional fields (role, enrolledCourses)
        // are saved too — the schema ignores anything it doesn't define.
        const newUser = new User(req.body)
        await newUser.save()

        res.status(201).json({
            msg: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                role: newUser.role
            }
        })
    } catch (err) {
        res.status(500).json({ msg: "Error registering user", error: err.message })
    }
}

// GET /user/getUser?phoneNumber=...
// Used by the login flow. Returns the full user document (including password)
// so the frontend can compare credentials, or the string "User not found"
// when there's no match — the auth slice checks for both.
function getUser(req, res) {
    User.findOne({ phoneNumber: req.query.phoneNumber })
        .then((user) => {
            if (!user) return res.send("User not found ")
            res.json(user)
        })
        .catch((err) => res.status(500).json({ msg: "Error fetching user", error: err.message }))
}

// GET /user/students   (staff only)
// Every student in the system — used by teachers to enroll students into a
// course. Password hashes are excluded by the projection.
function getStudents(req, res) {
    User.find({ role: "student" }, "name email phoneNumber enrolledCourses")
        .sort({ name: 1 })
        .then((data) => res.json(data))
        .catch((err) => res.status(500).json({ msg: "Error fetching students", error: err.message }))
}

function addUsers(req, res) {
    User.create(req.body)
        .then(function (users) {
            res.status(201).json({
                success: true,
                data: users
            });
        })
        .catch(function (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        });
}

module.exports = { addUser, getUser, addUsers, getStudents }
