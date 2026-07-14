// 👤 Profile Controller — Handles Everything About User Profiles
//
// This is like the "student services" office at a college:
//   • "Can I see my profile?"     → GET /api/profile
//   • "I want to update my info"  → PUT /api/profile
//   • "I forgot my password"      → PUT /api/profile/change-password
//   • "Let me upload my photo"    → POST /api/profile/upload-image
//
// 📌 How it works:
//    The User model stores LOGIN info (name, email, password, role).
//    The Profile model stores DETAILED info (academic, address, guardian, etc.).
//    They're linked by `userId` in the Profile model.
//
//    When you fetch your profile, we JOIN both together:
//      User (basic info)  +  Profile (detailed info)  =  Full Profile!

const User = require("../models/User.model");
const Profile = require("../models/Profile.model");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

// ============================================================
// GET PROFILE — Fetch the logged-in user's full profile
// ============================================================
// 📖 Combines User data (name, email, role) + Profile data (everything else)
// 🔒 Protected: Only the logged-in user can see their own profile
// ============================================================
async function getProfile(req, res) {
  try {
    // 🆔 Get user ID from the JWT token (set by authMiddleware)
    const userId = req.user.id;

    // 🔍 Find the user (basic info — without password)
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    // 🔍 Find the profile (detailed info) — or create one if it doesn't exist
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      // First time visiting profile? We'll auto-create a blank one!
      profile = new Profile({ userId });
      await profile.save();
    }

    // 🧩 Merge User data + Profile data into one combined response
    const fullProfile = {
      // From User model
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      enrolledCourses: user.enrolledCourses,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // From Profile model (overwrites any matching keys)
      studentId: profile.studentId || "",
      department: profile.department || "",
      course: profile.course || "",
      branch: profile.branch || "",
      year: profile.year || "",
      semester: profile.semester || "",
      section: profile.section || "",
      batch: profile.batch || "",
      phone: profile.phone || "",
      gender: profile.gender || "",
      dateOfBirth: profile.dateOfBirth || "",
      currentAddress: profile.currentAddress || "",
      permanentAddress: profile.permanentAddress || "",
      fatherName: profile.fatherName || "",
      motherName: profile.motherName || "",
      guardianPhone: profile.guardianPhone || "",
      specialization: profile.specialization || "",
      qualification: profile.qualification || "",
      profileImage: profile.profileImage || "",
      bio: profile.bio || "",

      // Social links (coding profiles & portfolio)
      socialLinks: profile.socialLinks || {},

      // 🚀 Projects (array of project objects — works for both students & faculty)
      projects: profile.projects || [],

      // 🎓 Education
      education: profile.education || [],

      // Work experience
      experience: profile.experience || [],

      // Skills
      skills: profile.skills || [],

      // Co-curricular & POR free-text
      coCurricularAndPor: profile.coCurricularAndPor || "",

      // Achievements & Certificates
      achievements: profile.achievements || "",
      certificates: profile.certificates || [],

      // Co-curricular activities
      coCurricular: profile.coCurricular || [],

      // Position of responsibility
      positionOfResponsibility: profile.positionOfResponsibility || [],

      // Profile metadata
      profileId: profile._id,
    };

    res.json(fullProfile);
  } catch (error) {
    console.error("❌ Error fetching profile:", error.message);
    res.status(500).json({ msg: "Server error while fetching profile." });
  }
}

// ============================================================
// UPDATE PROFILE — Edit the logged-in user's profile details
// ============================================================
// 📖 Saves data to the Profile model (not the User model!)
// 🔒 Protected: Only the logged-in user can edit their own profile
// ============================================================
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;

    // 📋 Fields that go into the Profile model (detailed info)
    const profileFields = [
      "studentId", "department", "course", "branch", "year",
      "semester", "section", "batch",
      "phone", "gender", "dateOfBirth",
      "currentAddress", "permanentAddress",
      "fatherName", "motherName", "guardianPhone",            "specialization", "qualification",
            "bio",
            "projects",  // 🚀 Projects array — works for students AND teachers
            "education",  // 🎓 Education entries
            "socialLinks",  // Social/coding profile links
            "experience",  // Work experience entries
            "skills",  // User skills
            "coCurricular",  // Co-curricular activities
            "positionOfResponsibility",  // Positions of responsibility
            "coCurricularAndPor",  // Co-curricular & POR free-text
            "achievements",  // Free-text achievements
            "certificates",  // Free-text certificates
    ];

    // 📋 Fields that go into the User model (basic info)
    const userFields = ["name", "email", "phoneNumber"];

    // 🧹 Collect profile fields to update
    const profileUpdate = {};
    for (const field of profileFields) {
      if (req.body[field] !== undefined) {
        profileUpdate[field] = req.body[field];
      }
    }

    // 🧹 Collect user fields to update
    const userUpdate = {};
    for (const field of userFields) {
      if (req.body[field] !== undefined) {
        userUpdate[field] = req.body[field];
      }
    }

    // 🚫 If no valid fields were sent, tell the user
    if (Object.keys(profileUpdate).length === 0 && Object.keys(userUpdate).length === 0) {
      return res.status(400).json({
        msg: "No valid fields to update.",
        hint: "You can update personal info, academic info, address, guardian, faculty info, and more.",
      });
    }

    // 🔄 Update the User model (if any user fields changed)
    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdate, {
        new: true,
        runValidators: true,
      });
    }

    // 🔄 Update the Profile model (upsert = create if doesn't exist)
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: profileUpdate },
      { new: true, upsert: true, runValidators: true }
    );

    // ✅ Fetch the merged result to send back
    const user = await User.findById(userId).select("-password");
    const fullProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      enrolledCourses: user.enrolledCourses,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      studentId: updatedProfile.studentId || "",
      department: updatedProfile.department || "",
      course: updatedProfile.course || "",
      branch: updatedProfile.branch || "",
      year: updatedProfile.year || "",
      semester: updatedProfile.semester || "",
      section: updatedProfile.section || "",
      batch: updatedProfile.batch || "",
      phone: updatedProfile.phone || "",
      gender: updatedProfile.gender || "",
      dateOfBirth: updatedProfile.dateOfBirth || "",
      currentAddress: updatedProfile.currentAddress || "",
      permanentAddress: updatedProfile.permanentAddress || "",
      fatherName: updatedProfile.fatherName || "",
      motherName: updatedProfile.motherName || "",
      guardianPhone: updatedProfile.guardianPhone || "",
      specialization: updatedProfile.specialization || "",
      qualification: updatedProfile.qualification || "",
      profileImage: updatedProfile.profileImage || "",
      bio: updatedProfile.bio || "",

      // Social links (coding profiles & portfolio)
      socialLinks: updatedProfile.socialLinks || {},

      // 🚀 Projects array — works for both students & faculty
      projects: updatedProfile.projects || [],

      // 🎓 Education
      education: updatedProfile.education || [],

      // Work experience
      experience: updatedProfile.experience || [],

      // Skills
      skills: updatedProfile.skills || [],

      // Co-curricular & POR free-text
      coCurricularAndPor: updatedProfile.coCurricularAndPor || "",

      // Achievements & Certificates
      achievements: updatedProfile.achievements || "",
      certificates: updatedProfile.certificates || [],

      // Co-curricular activities
      coCurricular: updatedProfile.coCurricular || [],

      // Position of responsibility
      positionOfResponsibility: updatedProfile.positionOfResponsibility || [],

      profileId: updatedProfile._id,
    };

    res.json({
      msg: "✅ Profile updated successfully!",
      user: fullProfile,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error.message);
    res.status(500).json({ msg: "Server error while updating profile." });
  }
}

// ============================================================
// CHANGE PASSWORD — Verify old password, then set new one
// ============================================================
// 🔒 This stays on the User model (password lives there, not in Profile)
// ============================================================
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // 🚫 Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        msg: "Both currentPassword and newPassword are required.",
      });
    }

    // 🔐 Password strength check
    if (newPassword.length < 6) {
      return res.status(400).json({
        msg: "New password must be at least 6 characters long.",
      });
    }

    // 🔍 Find the user (we need the password, so NO .select("-password"))
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    // ⚡ Check if old password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect." });
    }

    // 🔒 Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 💾 Save the updated user with the new password
    await user.save();

    res.json({ msg: "✅ Password changed successfully!" });
  } catch (error) {
    console.error("❌ Error changing password:", error.message);
    res.status(500).json({ msg: "Server error while changing password." });
  }
}

// ============================================================
// UPLOAD IMAGE — Upload a profile picture
// ============================================================
// 📸 Saves the image path to the Profile model
// ============================================================
async function uploadImage(req, res) {
  try {
    const userId = req.user.id;

    // 🚫 Check if a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({
        msg: "No file uploaded.",
        hint: "Send a file with the field name 'profileImage'",
      });
    }

    // 📸 Build the URL where the image can be accessed
    const imageUrl = `/uploads/profile-images/${req.file.filename}`;

    // 💾 Save the image URL to the Profile model (create if doesn't exist)
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: { profileImage: imageUrl } },
      { new: true, upsert: true }
    );

    res.json({
      msg: "✅ Profile image uploaded successfully!",
      imageUrl: imageUrl,
      profileImage: updatedProfile.profileImage,
    });
  } catch (error) {
    console.error("❌ Error uploading image:", error.message);
    res.status(500).json({ msg: "Server error while uploading image." });
  }
}

// 📦 Export all functions
module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadImage,
};
