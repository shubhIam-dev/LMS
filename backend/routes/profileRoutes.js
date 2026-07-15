const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    getProfile,
    updateProfile,
    changePassword,
    uploadImage,
} = require("../controllers/profileController");

const uploadDir = path.join(__dirname, "..", "uploads", "profile-images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const userId = req.body?.userId || req.query?.userId || "unknown";
        const uniqueName = `profile-${userId}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});

function fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Only image files (jpg, png, gif, webp) are allowed!"), false);
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter,
});

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/change-password", changePassword);
router.post("/upload-image", upload.single("profileImage"), uploadImage);

module.exports = router;
