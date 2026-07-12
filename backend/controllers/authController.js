// Auth controller — register, login (issues a JWT), and "who am I".
// Passwords are hashed by the User model's pre-save hook; we never store or
// return the plain text or the hash.

const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { JWT_SECRET } = require("../middleware/auth");

const TOKEN_TTL = "7d";

function signToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// POST /user/register
// Body: { name, email, password, phoneNumber, role? }
// Public self-registration is limited to students; creating a teacher or
// superadmin must go through a superadmin (see POST /user/adminCreateUser).
async function register(req, res) {
    try {
        const { name, email, password, phoneNumber } = req.body;
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ msg: "name, email, password and phoneNumber are required" });
        }

        const exists = await User.findOne({ phoneNumber });
        if (exists) return res.status(409).json({ msg: "An account with this phone number already exists" });

        const user = await User.create({ name, email, password, phoneNumber, role: "student" });
        const token = signToken(user);

        res.status(201).json({ msg: "Registered", token, user: user.toSafeJSON() });
    } catch (err) {
        res.status(500).json({ msg: "Error registering", error: err.message });
    }
}

// POST /user/login
// Body: { phoneNumber, password }
// Verifies the password against the bcrypt hash and returns a JWT.
async function login(req, res) {
    try {
        const { phoneNumber, password } = req.body;
        if (!phoneNumber || !password) {
            return res.status(400).json({ msg: "phoneNumber and password are required" });
        }

        const user = await User.findOne({ phoneNumber });
        // Same generic message whether the user is missing or the password is
        // wrong — don't reveal which phone numbers are registered.
        if (!user) return res.status(401).json({ msg: "Invalid phone number or password" });

        const ok = await user.comparePassword(password);
        if (!ok) return res.status(401).json({ msg: "Invalid phone number or password" });

        const token = signToken(user);
        res.json({ msg: "Logged in", token, user: user.toSafeJSON() });
    } catch (err) {
        res.status(500).json({ msg: "Error logging in", error: err.message });
    }
}

// GET /user/me   (requires authenticate)
// Returns the current user from the token — used by the frontend on refresh to
// re-hydrate the session without trusting client-side storage alone.
async function me(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json({ user: user.toSafeJSON() });
    } catch (err) {
        res.status(500).json({ msg: "Error fetching profile", error: err.message });
    }
}

// POST /user/adminCreateUser   (requires authenticate + authorize("superadmin"))
// Only a superadmin can mint teachers or other superadmins.
async function adminCreateUser(req, res) {
    try {
        const { name, email, password, phoneNumber, role } = req.body;
        if (!name || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ msg: "name, email, password, phoneNumber and role are required" });
        }
        if (!["student", "teacher", "superadmin"].includes(role)) {
            return res.status(400).json({ msg: "role must be student, teacher, or superadmin" });
        }

        const exists = await User.findOne({ phoneNumber });
        if (exists) return res.status(409).json({ msg: "An account with this phone number already exists" });

        const user = await User.create({ name, email, password, phoneNumber, role });
        res.status(201).json({ msg: `${role} created`, user: user.toSafeJSON() });
    } catch (err) {
        res.status(500).json({ msg: "Error creating user", error: err.message });
    }
}

module.exports = { register, login, me, adminCreateUser };
