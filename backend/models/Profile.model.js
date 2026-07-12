// 📋 Profile Model — Detailed Profile Information for Both Students & Faculty
//
// While the User model stores login info (name, email, password, phone, role),
// this Profile model stores EVERYTHING ELSE — academic details, addresses,
// guardian info, faculty qualifications, and profile picture.
//
// 💡 Think of it like this:
//    User model    = "Who you are" (login credentials)
//    Profile model = "All about you" (the detailed info)
//
// One User has ONE Profile (that's why userId is marked as "unique").
// When a new user registers, a profile is NOT automatically created — 
// they can fill it in later from their profile page.

let mongoose = require("mongoose");

let profileSchema = new mongoose.Schema(
  {
    // 👤 Link to the User — each profile belongs to ONE user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One profile per user — no duplicates!
    },

    // ========== STUDENT ACADEMIC INFO ==========
    studentId: { type: String, default: "" }, // Roll number (e.g. "STU2024001")
    department: { type: String, default: "" }, // e.g. "Computer Science"
    course: { type: String, default: "" }, // e.g. "B.Tech", "B.Sc"
    branch: { type: String, default: "" }, // e.g. "CSE", "ECE", "ME"
    year: { type: String, default: "" }, // e.g. "1st Year", "2nd Year"
    semester: { type: String, default: "" }, // e.g. "Sem 1", "Sem 2"
    section: { type: String, default: "" }, // e.g. "A", "B"
    batch: { type: String, default: "" }, // e.g. "2024-2028"

    // ========== PERSONAL INFO (for both students & faculty) ==========
    phone: { type: String, default: "" }, // Alternate phone number
    gender: { type: String, default: "" }, // "Male", "Female", "Other"
    dateOfBirth: { type: String, default: "" }, // e.g. "2000-01-15"

    // ========== ADDRESS ==========
    currentAddress: { type: String, default: "" },
    permanentAddress: { type: String, default: "" },

    // ========== GUARDIAN INFO (mostly for students) ==========
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    guardianPhone: { type: String, default: "" },

    // ========== FACULTY INFO (for teachers) ==========
    specialization: { type: String, default: "" }, // e.g. "Artificial Intelligence"
    qualification: { type: String, default: "" }, // e.g. "Ph.D.", "M.Tech"

    // ========== PROFILE PICTURE ==========
    profileImage: { type: String, default: "" }, // Path to uploaded image

    // ========== EXTRA (for future use) ==========
    bio: { type: String, default: "" }, // Short bio / about me
  },
  { timestamps: true } // ⏰ Auto-adds createdAt and updatedAt
);

module.exports = mongoose.model("Profile", profileSchema);
