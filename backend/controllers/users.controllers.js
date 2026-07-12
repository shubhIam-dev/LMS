// 👤 Users Controller — Handles Login, Registration, and User Lookup
//
// Think of this as the front desk at a college:
//   • "A new student wants to register!" → addUser()
//   • "Someone wants to log in"         → loginUser() (NEW - with JWT!)
//   • "Find this student by phone"      → getUser()
//   • "Add a bunch of students"         → addUsers()

const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

// ============================================================
// REGISTER — Add a new user to the database
// ============================================================
function addUser(req, res) {
  const { name, email, password, phoneNumber } = req.body;

  // 🚫 Make sure all required fields are filled
  if (!name || !email || !password || !phoneNumber) {
    return res.send({ message: "All fields are required" });
  }

  // 🔒 Hash the password before saving (like scrambling an egg — once it's done, you can't unscramble it!)
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      let newUser = new User({
        name,
        email,
        password: hash, // Store the HASHED password, not the original!
        phoneNumber,
      });

      newUser.save().then(() => {
        res.json({
          message: "User registered successfully",
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
        });
      });
    });
  });
}

// ============================================================
// LOGIN — Authenticate user and return JWT token
// ============================================================
// 🔐 NEW: This is the PROPER login flow with JWT!
//    The frontend sends phone + password, backend verifies and returns a token.
//    This token is like a VIP pass — show it to access protected routes!
// ============================================================
async function loginUser(req, res) {
  try {
    const { phoneNumber, password } = req.body;

    // 🚫 Validate input
    if (!phoneNumber || !password) {
      return res.status(400).json({ msg: "Phone number and password are required." });
    }

    // 🔍 Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ msg: "User not found. Check your phone number." });
    }

    // 🔐 Compare password with the hashed one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Wrong password! Please try again." });
    }

    // ✅ Generate JWT token — a digital ID card that expires in 7 days
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // 📦 Send back user data (without password) + the token
    const userData = user.toObject();
    delete userData.password;

    res.json({
      msg: "✅ Login successful!",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ msg: "Server error during login." });
  }
}

// ============================================================
// GET USER — Find a user by phone number (OLD login flow)
// ============================================================
// 📞 This is the OLD way the frontend logs in (kept for backward compatibility).
//    It finds a user by phone and returns their data. Password comparison
//    happens on the frontend.
// ============================================================
function getUser(req, res) {
  const { phoneNumber } = req.query;
  if (!phoneNumber) {
    return res.send("Phone number is required");
  }

  User.findOne({ phoneNumber: phoneNumber })
    .then((user) => {
      if (!user) {
        res.send("User not found");
      } else {
        // Return user data with a token for backward compatibility
        const token = jwt.sign(
          { id: user._id, role: user.role, phoneNumber: user.phoneNumber },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        res.json({ ...user.toObject(), token });
      }
    })
    .catch((err) => {
      res.status(500).send("Server error");
    });
}

// ============================================================
// ADD MULTIPLE USERS — For bulk registration
// ============================================================
function addUsers(req, res) {
  User.insertMany(req.body)
    .then(() => {
      res.json({ message: "Users registered successfully" });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error adding users", error: err.message });
    });
}

module.exports = { addUser, loginUser, getUser, addUsers };
