<<<<<<< HEAD
// 🌐 API Service — This is like a phonebook for the backend
// It stores all the backend addresses and helps us call them

// The base URL where our backend server is running
// Localhost means it's on our own computer, port 9000 is the door number
// 📦 Exported so profile pages can use it for image paths too
export const BASE_URL = "http://localhost:9000";

// 🔑 Helper: Get the JWT token from localStorage
// This token proves "Hey, I'm already logged in!"
function getToken() {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.token || null;
    }
    return null;
  } catch {
    return null;
  }
}
=======
// 🌐 API Service — one place for every backend call.
// All requests automatically carry the JWT (if we have one) so the backend's
// authenticate/authorize middleware lets them through.

const BASE_URL = "http://localhost:9000";
const TOKEN_KEY = "token";
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Central fetch wrapper: sets JSON headers, attaches the Bearer token, and
// surfaces backend error messages.
async function callApi(endpoint, options = {}) {
  try {
<<<<<<< HEAD
    // 🔐 Attach JWT token if we have one (for protected routes)
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // Make the actual fetch request to the backend
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    // 📝 Handle BOTH JSON and plain-text responses
    // Some old endpoints return plain strings like "User not found"
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text); // Try parsing as JSON
    } catch {
      data = text; // If that fails, use the raw text
    }

    // If the server says something went wrong, show the error
    if (!response.ok) {
      throw new Error(data.msg || data || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error);
=======
    const token = getToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let msg = "Something went wrong";
      try {
        const err = await response.json();
        msg = err.msg || msg;
      } catch {
        /* non-JSON error body */
      }
      throw new Error(msg);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
    throw error;
  }
}

<<<<<<< HEAD
// 🔑 Export the token helper so other modules can use it too
export { getToken };

// 👤 USER API — All functions related to students
export const userApi = {
  // 🔐 NEW: Proper JWT login
  // This sends phone + password to the backend, which verifies and returns a token
  loginWithJWT: (phoneNumber, password) => {
=======
// 👤 AUTH / USER
export const userApi = {
  // Log in with phone + password → { token, user }
  login: (phoneNumber, password) => {
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
    return callApi("/user/login", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, password }),
    });
<<<<<<< HEAD
  },

  // Log in a user by their phone number (OLD way — kept for compatibility)
  login: (phoneNumber) => {
    return callApi(`/user/getUser?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  },

  // Register a new student
=======
  },

  // Self-registration (always creates a student) → { token, user }
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
  register: (userData) => {
    return callApi("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

<<<<<<< HEAD
// 📚 COURSES API — All functions related to courses
export const courseApi = {
  getAllCourses: () => {
    return callApi("/course/getAllCourses");
  },
  getCourseById: (id) => {
    return callApi(`/course/getCourseById`, {
      method: "GET",
      body: JSON.stringify({ _id: id }),
=======
  // Re-hydrate the current user from the token on app start.
  me: () => callApi("/user/me"),

  // Superadmin: create a teacher / superadmin / student.
  adminCreateUser: (userData) => {
    return callApi("/user/adminCreateUser", {
      method: "POST",
      body: JSON.stringify(userData),
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
    });
  },

  // Staff: every student in the system (for enrolling into a course).
  getStudents: () => callApi("/user/students"),
};

<<<<<<< HEAD
// 📝 ASSIGNMENTS API
export const assignmentApi = {
  getAllAssignments: () => {
    return callApi("/assignments/getAllAssignments");
  },
};

// 📊 MARKS API
export const marksApi = {
  getMarksByStudent: (studentId) => {
    return callApi(`/marks/getMarksByStudent?studentId=${encodeURIComponent(studentId)}`);
  },
  getAllMarks: () => {
    return callApi("/marks/getAllMarks");
  },
};

// 👤 PROFILE API — New! For viewing and editing user profiles
export const profileApi = {
  // Get the logged-in user's full profile
  getProfile: () => {
    return callApi("/api/profile");
  },

  // Update profile information
  updateProfile: (profileData) => {
    return callApi("/api/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Change password (need old + new)
  changePassword: (currentPassword, newPassword) => {
    return callApi("/api/profile/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Upload profile picture
  uploadImage: async (file) => {
    // 📸 For file uploads, we use FormData (not JSON!)
    const formData = new FormData();
    formData.append("profileImage", file);

    const token = getToken();
    const response = await fetch(`${BASE_URL}/api/profile/upload-image`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Note: Don't set Content-Type for FormData — the browser does it automatically!
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || "Failed to upload image");
    }
    return data;
  },
=======
// 📚 COURSES
export const courseApi = {
  getAllCourses: () => callApi("/course/getAllCourses"),
  getCourseById: (id) => callApi(`/course/getCourseById?_id=${encodeURIComponent(id)}`),

  // staff only
  addCourse: (data) =>
    callApi("/course/addCourse", { method: "POST", body: JSON.stringify(data) }),
  enrollStudent: (courseId, studentId) =>
    callApi("/course/enrollStudent", {
      method: "POST",
      body: JSON.stringify({ courseId, studentId }),
    }),
  // the roster: students enrolled in one course
  getStudents: (courseId) =>
    callApi(`/course/getStudents?courseId=${encodeURIComponent(courseId)}`),
};

// ❓ QUESTIONS (shared question bank — every teacher sees every question)
export const questionApi = {
  // filters: { q, topic, difficulty, questionType } — all optional
  getAll: (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v)
    ).toString();
    return callApi(`/questions/getAllQuestions${qs ? `?${qs}` : ""}`);
  },
  // staff only
  add: (data) =>
    callApi("/questions/addQuestion", { method: "POST", body: JSON.stringify(data) }),
};

// 📝 ASSIGNMENTS
export const assignmentApi = {
  getAllAssignments: () => callApi("/assignments/getAllAssignments"),
  getByCourse: (courseId) =>
    callApi(`/assignments/getByCourse?courseId=${encodeURIComponent(courseId)}`),

  getAssignmentById: (id) =>
    callApi(`/assignments/getAssignmentById?id=${encodeURIComponent(id)}`),

  // staff only
  addAssignment: (data) =>
    callApi("/assignments/addAssignment", { method: "POST", body: JSON.stringify(data) }),
  addQuestionsToAssignment: (assignmentId, questionIds) =>
    callApi("/assignments/addQuestionsToAssignment", {
      method: "POST",
      body: JSON.stringify({ assignmentId, questionIds }),
    }),
  // clone another teacher's assignment into your own course
  reuse: (assignmentId, courseId, dueOn) =>
    callApi("/assignments/reuse", {
      method: "POST",
      body: JSON.stringify({ assignmentId, courseId, dueOn }),
    }),
};

// 📤 SUBMISSIONS & GRADING
export const submissionApi = {
  // student: submit answers to an assignment
  submit: (payload) =>
    callApi("/submissions/submit", { method: "POST", body: JSON.stringify(payload) }),
  getByStudent: (studentId) =>
    callApi(`/submissions/getByStudent?studentId=${encodeURIComponent(studentId)}`),

  // staff: review + grade
  getByAssignment: (assignmentId) =>
    callApi(`/submissions/getByAssignment?assignmentId=${encodeURIComponent(assignmentId)}`),
  gradeManual: (submissionId, perQuestion) =>
    callApi("/submissions/gradeManual", {
      method: "POST",
      body: JSON.stringify({ submissionId, perQuestion }),
    }),
};

// 📊 MARKS
export const marksApi = {
  getMarksByStudent: (studentId) =>
    callApi(`/marks/getMarksByStudent?studentId=${encodeURIComponent(studentId)}`),
  getAllMarks: () => callApi("/marks/getAllMarks"),
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
};
