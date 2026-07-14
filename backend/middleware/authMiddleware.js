// 🛡️ Auth Middleware — The Security Guard for Protected Routes
//
// This is like a security checkpoint at a college gate:
//   1️⃣ You show your ID card (JWT token)
//   2️⃣ The guard checks if it's valid and not expired
//   3️⃣ If valid → you're allowed in (next() is called)
//   4️⃣ If invalid → you're turned away (401 Unauthorized)
//
// 📌 What is JWT?
//    JWT (JSON Web Token) is like a digital ID card. When you log in,
//    the server gives you a special token. You send this token with every
//    request to prove "Hey, I'm already logged in!"
//
// 📌 How to use this middleware:
//    router.get("/some-route", authMiddleware, controllerFunction)
//    This means: "First check the token, THEN run the controller"

const jwt = require("jsonwebtoken");

// 🔐 Secret key used to sign and verify tokens
// In production, this should be in your .env file!
const JWT_SECRET = process.env.JWT_SECRET || "lms-secret-key-2024";

function authMiddleware(req, res, next) {
  // 🎫 Step 1: Get the token from the request headers
  // The frontend sends it like: Authorization: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // 🚫 No token found — access denied!
    return res.status(401).json({
      msg: "Access denied. No token provided.",
      hint: "Make sure you're sending the Authorization header as 'Bearer <token>'",
    });
  }

  // Extract just the token part (remove "Bearer " from the beginning)
  const token = authHeader.split(" ")[1];

  try {
    // ✅ Step 2: Verify the token is valid and not expired
    // jwt.verify() decodes the token and checks the signature
    const decoded = jwt.verify(token, JWT_SECRET);

    // 📋 Step 3: Attach the user data to the request object
    // Now any controller after this can access `req.user`
    req.user = decoded;

    // 🚀 Step 4: Pass control to the next function (the controller)
    next();
  } catch (error) {
    // ❌ Token is invalid or expired
    return res.status(401).json({
      msg: "Invalid or expired token.",
      error: error.message,
    });
  }
}

// 📦 Export so routes can use it
module.exports = { authMiddleware, JWT_SECRET };
