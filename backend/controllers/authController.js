const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { JWT_SECRET } = require("../middleware/auth");

const TOKEN_TTL = "7d";

function signToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function register(req, res) {
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
        return res.status(400).json({ msg: "name, email, password and phoneNumber are required" });
    }

    User.findOne({ phoneNumber })
        .then(exists => {
            if (exists) return res.status(409).json({ msg: "An account with this phone number already exists" });
            return User.create({ name, email, password, phoneNumber, role: "student" });
        })
        .then(user => {
            const token = signToken(user);
            res.status(201).json({ msg: "Registered", token, user: user.toSafeJSON() });
        })
        .catch(err => res.status(500).json({ msg: "Error registering", error: err.message }));
}

function login(req, res) {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        return res.status(400).json({ msg: "phoneNumber and password are required" });
    }

    User.findOne({ phoneNumber })
        .then(user => {
            if (!user) return res.status(401).json({ msg: "Invalid phone number or password" });
            if (user.password !== password) return res.status(401).json({ msg: "Invalid phone number or password" });
            const token = signToken(user);
            res.json({ msg: "Logged in", token, user: user.toSafeJSON() });
        })
        .catch(err => res.status(500).json({ msg: "Error logging in", error: err.message }));
}

function me(req, res) {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ msg: "userId is required" });

    User.findById(userId)
        .then(user => {
            if (!user) return res.status(404).json({ msg: "User not found" });
            res.json({ user: user.toSafeJSON() });
        })
        .catch(err => res.status(500).json({ msg: "Error fetching profile", error: err.message }));
}

module.exports = { register, login, me };
