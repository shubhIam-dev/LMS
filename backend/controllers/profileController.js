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

function getProfile(req, res) {
    const userId = req.query.userId || req.body.userId;
    if (!userId) return res.status(400).json({ msg: "userId is required" });

    User.findById(userId).select("-password")
        .then(user => {
            if (!user) return res.status(404).json({ msg: "User not found." });
            return Profile.findOne({ userId })
                .then(profile => {
                    if (!profile) {
                        profile = new Profile({ userId });
                        return profile.save().then(() => profile);
                    }
                    return profile;
                })
                .then(profile => {
                    const fullProfile = {
                        _id: user._id, name: user.name, email: user.email,
                        phoneNumber: user.phoneNumber, role: user.role,
                        enrolledCourses: user.enrolledCourses,
                        createdAt: user.createdAt, updatedAt: user.updatedAt,
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
                        socialLinks: profile.socialLinks || {},
                        projects: profile.projects || [],
                        education: profile.education || [],
                        experience: profile.experience || [],
                        skills: profile.skills || [],
                        coCurricularAndPor: profile.coCurricularAndPor || "",
                        achievements: profile.achievements || "",
                        certificates: profile.certificates || [],
                        coCurricular: profile.coCurricular || [],
                        positionOfResponsibility: profile.positionOfResponsibility || [],
                        profileId: profile._id,
                    };
                    res.json(fullProfile);
                });
        })
        .catch(error => {
            console.error("Error fetching profile:", error.message);
            res.status(500).json({ msg: "Server error while fetching profile." });
        });
}

function updateProfile(req, res) {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ msg: "userId is required" });

    const profileFields = [
        "studentId", "department", "course", "branch", "year",
        "semester", "section", "batch",
        "phone", "gender", "dateOfBirth",
        "currentAddress", "permanentAddress",
        "fatherName", "motherName", "guardianPhone",
        "specialization", "qualification",
        "bio", "projects", "education", "socialLinks",
        "experience", "skills", "coCurricular",
        "positionOfResponsibility", "coCurricularAndPor",
        "achievements", "certificates"
    ];
    const userFields = ["name", "email", "phoneNumber"];

    const profileUpdate = {};
    for (const field of profileFields) {
        if (req.body[field] !== undefined) profileUpdate[field] = req.body[field];
    }
    const userUpdate = {};
    for (const field of userFields) {
        if (req.body[field] !== undefined) userUpdate[field] = req.body[field];
    }

    if (Object.keys(profileUpdate).length === 0 && Object.keys(userUpdate).length === 0) {
        return res.status(400).json({ msg: "No valid fields to update." });
    }

    let updateUser = Promise.resolve();
    if (Object.keys(userUpdate).length > 0) {
        updateUser = User.findByIdAndUpdate(userId, userUpdate, { new: true, runValidators: true }).then(() => {});
    }

    updateUser
        .then(() => Profile.findOneAndUpdate(
            { userId },
            { $set: profileUpdate },
            { new: true, upsert: true, runValidators: true }
        ))
        .then(updatedProfile => User.findById(userId).select("-password").then(user => ({ user, updatedProfile })))
        .then(({ user, updatedProfile }) => {
            const fullProfile = {
                _id: user._id, name: user.name, email: user.email,
                phoneNumber: user.phoneNumber, role: user.role,
                enrolledCourses: user.enrolledCourses,
                createdAt: user.createdAt, updatedAt: user.updatedAt,
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
                socialLinks: updatedProfile.socialLinks || {},
                projects: updatedProfile.projects || [],
                education: updatedProfile.education || [],
                experience: updatedProfile.experience || [],
                skills: updatedProfile.skills || [],
                coCurricularAndPor: updatedProfile.coCurricularAndPor || "",
                achievements: updatedProfile.achievements || "",
                certificates: updatedProfile.certificates || [],
                coCurricular: updatedProfile.coCurricular || [],
                positionOfResponsibility: updatedProfile.positionOfResponsibility || [],
                profileId: updatedProfile._id,
            };
            res.json({ msg: "Profile updated successfully!", user: fullProfile });
        })
        .catch(error => {
            console.error("Error updating profile:", error.message);
            res.status(500).json({ msg: "Server error while updating profile." });
        });
}

function changePassword(req, res) {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ msg: "userId is required" });
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ msg: "Both currentPassword and newPassword are required." });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ msg: "New password must be at least 6 characters long." });
    }

    User.findById(userId)
        .then(user => {
            if (!user) return res.status(404).json({ msg: "User not found." });
            if (user.password !== currentPassword) {
                return res.status(400).json({ msg: "Current password is incorrect." });
            }
            user.password = newPassword;
            return user.save().then(() => res.json({ msg: "Password changed successfully!" }));
        })
        .catch(error => {
            console.error("Error changing password:", error.message);
            res.status(500).json({ msg: "Server error while changing password." });
        });
}

function uploadImage(req, res) {
    const userId = req.body.userId || req.query.userId;
    if (!userId) return res.status(400).json({ msg: "userId is required" });

    if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded.", hint: "Send a file with the field name 'profileImage'" });
    }

    const imageUrl = `/uploads/profile-images/${req.file.filename}`;

    Profile.findOneAndUpdate(
        { userId },
        { $set: { profileImage: imageUrl } },
        { new: true, upsert: true }
    )
        .then(updatedProfile => {
            res.json({ msg: "Profile image uploaded successfully!", imageUrl, profileImage: updatedProfile.profileImage });
        })
        .catch(error => {
            console.error("Error uploading image:", error.message);
            res.status(500).json({ msg: "Server error while uploading image." });
        });
}

module.exports = { getProfile, updateProfile, changePassword, uploadImage };
