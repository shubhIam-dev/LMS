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

    // ========== SOCIAL LINKS — Coding profiles & portfolio for both students & faculty ==========
    // Each link is a URL to the user's profile on various platforms
    socialLinks: {
      type: {
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        hackerearth: { type: String, default: "" },
        hackerrank: { type: String, default: "" },
        codechef: { type: String, default: "" },
        leetcode: { type: String, default: "" },
        codeforces: { type: String, default: "" },
        kaggle: { type: String, default: "" },
        portfolio: { type: String, default: "" },
      },
      default: {}, // Empty object = no links set yet
    },

    // ========== PROJECTS (for both students & faculty) ==========
    // Each project has:
    //    title        -> Name of the project (e.g. "Library Management System")
    //    description  -> What the project does (short explanation)
    //    technologies -> Tools used (e.g. "React, Node.js, MongoDB")
    //    gitLink      -> URL to GitHub/Git repository (source code)
    //    hostLink     -> URL to live/hosted version of the project
    //    startDate    -> When you started the project
    //    endDate      -> When you finished it (or "Present" if ongoing)
    projects: {
      type: [
        {
          title: { type: String, default: "" },
          description: { type: String, default: "" },
          technologies: { type: String, default: "" },
          gitLink: { type: String, default: "" },
          hostLink: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
        },
      ],
      default: [], // Start with an empty list — no projects yet!
    },

    // ========== CO-CURRICULAR & POSITION OF RESPONSIBILITY ==========
    coCurricularAndPor: { type: String, default: "" }, // Free-text like bio

    // ========== SKILLS (for both students & faculty) ==========
    // User-selected skills from a predefined list
    skills: { type: [String], default: [] },

    // ========== WORK EXPERIENCE (for both students & faculty) ==========
    experience: {
      type: [
        {
          company: { type: String, default: "" },
          position: { type: String, default: "" },
          description: { type: String, default: "" },
          location: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
        },
      ],
      default: [],
    },

    // ========== CO-CURRICULAR ACTIVITIES (for both students & faculty) ==========
    coCurricular: {
      type: [
        {
          activity: { type: String, default: "" },
          role: { type: String, default: "" },
          description: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
        },
      ],
      default: [],
    },

    // ========== POSITION OF RESPONSIBILITY (for both students & faculty) ==========
    positionOfResponsibility: {
      type: [
        {
          position: { type: String, default: "" },
          organization: { type: String, default: "" },
          description: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
        },
      ],
      default: [],
    },

    // ========== EDUCATION (for both students & faculty) ==========
    education: {
      type: [
        {
          level: { type: String, default: "" }, // 10th, 12th, Graduation, Post Graduation
          institute: { type: String, default: "" },
          degree: { type: String, default: "" },
          fieldOfStudy: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
          gradeType: { type: String, default: "" }, // CGPA, Percentage, Custom
          grade: { type: String, default: "" },
          maxGrade: { type: String, default: "" },
        },
      ],
      default: [],
    },

    // ========== ACHIEVEMENTS ==========
    achievements: { type: String, default: "" }, // Free-text achievements

    // ========== CERTIFICATES ==========
    // Each certificate has:
    //    title        -> Name of the certificate (e.g. "AWS Certified Solutions Architect")
    //    organization -> Provider organization name (e.g. "Amazon Web Services")
    //    startDate    -> Date of completion/issue
    //    link         -> URL to verify the certificate
    //    description  -> Brief description of what was covered
    certificates: {
      type: [
        {
          title: { type: String, default: "" },
          organization: { type: String, default: "" },
          startDate: { type: String, default: "" },
          link: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },

    // ========== EXTRA (for future use) ==========
    bio: { type: String, default: "" }, // Short bio / about me
  },
  { timestamps: true } // ⏰ Auto-adds createdAt and updatedAt
);

module.exports = mongoose.model("Profile", profileSchema);
