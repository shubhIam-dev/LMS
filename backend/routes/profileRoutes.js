// 🗺️ Profile Routes — The Address Book for Profile API Calls
//
// Think of this as the directory at a college:
//   "Profile Office? Take a right at the main entrance."
//   "Want to change password? Second door on the left."
//
// Each route maps a URL to a controller function.
// The authMiddleware acts as a security guard: "Show me your ID first!"

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔐 Import the auth middleware (security guard)
const { authMiddleware } = require("../middleware/authMiddleware");

// 👤 Import the profile controller (the actual worker)
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadImage,
} = require("../controllers/profileController");

// ============================================================
// 📸 SETUP: Multer — For Handling File Uploads
// ============================================================
// Multer is like a mail room clerk who receives packages (files)
// and puts them in the right storage location.

// 📁 Make sure the uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "profile-images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🎨 Configure how files should be stored
const storage = multer.diskStorage({
  // Where to save the file
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  // What to name the file (use timestamp to avoid name conflicts)
  filename: function (req, file, cb) {
    // Extract the file extension (like .jpg, .png)
    const ext = path.extname(file.originalname);
    // Create a unique name: userId-timestamp.jpg
    const uniqueName = `profile-${req.user.id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// 🎯 Filter: Only allow image files
function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true); // ✅ File is OK
  } else {
    cb(new Error("Only image files (jpg, png, gif, webp) are allowed!"), false);
  }
}

// ⚙️ Create the multer instance with our config
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter,
});

// ============================================================
// 📍 ROUTES — The actual API endpoints
// ============================================================

// 📖 GET /api/profile — Get my profile
//    authMiddleware = security guard checks your ID
//    getProfile = the actual function that does the work
router.get("/", authMiddleware, getProfile);

// ✏️ PUT /api/profile — Update my profile
router.put("/", authMiddleware, updateProfile);

// 🔑 PUT /api/profile/change-password — Change my password
router.put("/change-password", authMiddleware, changePassword);

// 📸 POST /api/profile/upload-image — Upload profile picture
//    upload.single("profileImage") = multer processes one file named "profileImage"
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("profileImage"),
  uploadImage
);

module.exports = router;
