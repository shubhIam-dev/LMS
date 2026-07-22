// 🌐 API Service — Axios-based central API layer.
// Every request automatically carries the JWT token. API error handling is unified.
// Components must NEVER call axios directly. Use the exported functions below.

import axios from "axios";

const BASE_URL = "http://localhost:9000";
const TOKEN_KEY = "token";

// ── Token helpers ───────────────────────────────────────────────────────────

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
    throw error;
  }
}

function getUserId() {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u)._id || JSON.parse(u).id : "";
  } catch {
    return "";
  }
}

// ── Axios instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach JWT token automatically.
// Skips public auth endpoints (login, register) — no token needed there.
api.interceptors.request.use((config) => {
  // Public auth endpoints should not carry Authorization headers
  if (config.url?.includes("/user/login") || config.url?.includes("/user/register")) {
    return config;
  }
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: extract data, unify error messages
api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    let message = "Something went wrong";
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      // Keep the backend's specific error message if available;
      // only fall back to generic messages when the backend gives none.
      const backendMsg = data?.msg || data?.message;
      if (backendMsg) {
        message = backendMsg;
      } else if (status === 401) {
        message = "Session expired. Please log in again.";
      } else if (status === 403) {
        message = "You don't have permission to do that.";
      } else if (status === 404) {
        message = "The requested resource was not found.";
      } else if (status === 500) {
        message = "Server error. Please try again later.";
      }
    } else if (error.request) {
      message = "No response from server. Check your connection.";
    } else {
      message = error.message || message;
    }
    console.error(`API Error (${error.config?.url || "unknown"}):`, message);
    return Promise.reject(new Error(message));
  }
);

// ── Helper: get user ID from localStorage for profile calls ────────────────

// ── AUTH / USER ────────────────────────────────────────────────────────────

export const userApi = {
  /** POST /user/login → { token, user } */
  login: (phoneNumber, password) =>
    api.post("/user/login", { phoneNumber, password }),

  /** POST /user/register → { token, user } */
  register: (userData) => api.post("/user/register", userData),

  /** GET /user/me → { user } — re-hydrate session from token */
  me: () => api.get("/user/me"),

  /** POST /user/adminCreateUser — superadmin only */
  adminCreateUser: (userData) => api.post("/user/adminCreateUser", userData),

  /** GET /user/students — staff only: list all students */
  getStudents: () => api.get("/user/students"),
};

// ── PROFILE ────────────────────────────────────────────────────────────────

export const profileApi = {
  /** GET /api/profile?userId=X → full profile object */
  /** Pass optional userId to view another user's profile (faculty viewing student) */
  getProfile: (userId) => api.get(`/api/profile?userId=${encodeURIComponent(userId || getUserId())}`),

  /** PUT /api/profile → { msg, user } */
  updateProfile: (data) =>
    api.put("/api/profile", { ...data, userId: data._id || getUserId() }),

  /** PUT /api/profile/change-password → { msg } */
  changePassword: (currentPassword, newPassword) =>
    api.put("/api/profile/change-password", {
      currentPassword,
      newPassword,
      userId: getUserId(),
    }),

  /** POST /api/profile/upload-image → { msg, imageUrl } */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("userId", getUserId());
    const token = getToken();
    const response = await axios.post(`${BASE_URL}/api/profile/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return response.data;
  },
};

// ── DASHBOARD ──────────────────────────────────────────────────────────────

export const dashboardApi = {
  /** GET /dashboard/student → aggregated student dashboard data */
  /** Supports ?studentId=xxx for faculty viewing a specific student */
  getStudentDashboard: (studentId) => {
    const params = studentId ? `?studentId=${encodeURIComponent(studentId)}` : "";
    return api.get(`/dashboard/student${params}`);
  },

  /** GET /dashboard/faculty → aggregated faculty dashboard data */
  getFacultyDashboard: () => api.get("/dashboard/faculty"),

  /** GET /faculty/students → students assigned to this faculty */
  getFacultyStudents: () => api.get("/faculty/students"),

  /** GET /dashboard/admin → system-wide admin stats */
  getAdminDashboard: () => api.get("/dashboard/admin"),
};

// ── COURSES ────────────────────────────────────────────────────────────────

export const courseApi = {
  getAllCourses: () => api.get("/course/getAllCourses"),
  getCourseById: (id) => api.get(`/course/getCourseById?_id=${encodeURIComponent(id)}`),
  addCourse: (data) => api.post("/course/addCourse", data),
  updateCourse: (data) => api.post("/course/updateCourseById", data),
  deleteCourse: (id) => api.post("/course/deleteCourse", { _id: id }),
  enrollStudent: (courseId, studentId) =>
    api.post("/course/enrollStudent", { courseId, studentId }),
  getStudents: (courseId) =>
    api.get(`/course/getStudents?courseId=${encodeURIComponent(courseId)}`),
  /** POST /course/selfEnroll — student enrolls themselves */
  selfEnroll: (courseId) => api.post("/course/selfEnroll", { courseId }),
  /** GET /course/progress?courseId=X&studentId=Y */
  getProgress: (courseId, studentId) =>
    api.get(`/course/progress?courseId=${encodeURIComponent(courseId)}&studentId=${encodeURIComponent(studentId)}`),
};

// ── ASSIGNMENTS ────────────────────────────────────────────────────────────

export const assignmentApi = {
  getAllAssignments: () => api.get("/assignments/getAllAssignments"),
  getByCourse: (courseId) =>
    api.get(`/assignments/getByCourse?courseId=${encodeURIComponent(courseId)}`),
  getAssignmentById: (id) =>
    api.get(`/assignments/getAssignmentById?id=${encodeURIComponent(id)}`),
  addAssignment: (data) => api.post("/assignments/addAssignment", data),
  addQuestionsToAssignment: (assignmentId, questionIds) =>
    api.post("/assignments/addQuestionsToAssignment", { assignmentId, questionIds }),
  reuse: (assignmentId, courseId, dueOn) =>
    api.post("/assignments/reuse", { assignmentId, courseId, dueOn }),
  /** PUT /assignments/updateAssignmentById — used to replace questions array, etc. */
  updateAssignment: (data) => api.put("/assignments/updateAssignmentById", data),
  /** POST /assignments/deleteAssignment */
  deleteAssignment: (data) => api.post("/assignments/deleteAssignment", data),
};

// ── MARKS ──────────────────────────────────────────────────────────────────

export const marksApi = {
  getMarksByStudent: (studentId) =>
    api.get(`/marks/getMarksByStudent?studentId=${encodeURIComponent(studentId)}`),
  getAllMarks: () => api.get("/marks/getAllMarks"),
};

// ── SUBMISSIONS ────────────────────────────────────────────────────────────

export const submissionApi = {
  submit: (payload) => api.post("/submissions/submit", payload),
  getByStudent: (studentId) =>
    api.get(`/submissions/getByStudent?studentId=${encodeURIComponent(studentId)}`),
  getByAssignment: (assignmentId) =>
    api.get(`/submissions/getByAssignment?assignmentId=${encodeURIComponent(assignmentId)}`),
  gradeManual: (submissionId, perQuestion) =>
    api.post("/submissions/gradeManual", { submissionId, perQuestion }),
};

// ── QUESTIONS ──────────────────────────────────────────────────────────────

export const questionApi = {
  getAll: (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v)
    ).toString();
    return api.get(`/questions/getAllQuestions${qs ? `?${qs}` : ""}`);
  },
  add: (data) => api.post("/questions/addQuestion", data),
  update: (id, data) => api.put("/questions/updateQuestionById", { id, ...data }),
  delete: (id) => api.post("/questions/deleteQuestion", { id }),
};

// ── NOTES ──────────────────────────────────────────────────────────────

export const notesApi = {
  /** GET /notes/getByCourse?courseId=X */
  getByCourse: (courseId) =>
    api.get(`/notes/getByCourse?courseId=${encodeURIComponent(courseId)}`),
  /** POST /notes/addNote */
  add: (data) => api.post("/notes/addNote", data),
  /** POST /notes/deleteNote */
  delete: (id) => api.post("/notes/deleteNote", { id }),
};

// ── ANNOUNCEMENTS ────────────────────────────────────────────────────────

export const announcementApi = {
  /** GET /announcements/getByCourse?courseId=X */
  getByCourse: (courseId) =>
    api.get(`/announcements/getByCourse?courseId=${encodeURIComponent(courseId)}`),
  /** POST /announcements/addAnnouncement */
  add: (data) => api.post("/announcements/addAnnouncement", data),
  /** POST /announcements/deleteAnnouncement */
  delete: (id) => api.post("/announcements/deleteAnnouncement", { id }),
};

// ── Named convenience exports (for the user's requested function names) ──

export const getStudentProfile = () => profileApi.getProfile();
export const getStudentProfileById = (studentId) => profileApi.getProfile(studentId);
export const getFacultyProfile = () => profileApi.getProfile();
export const updateStudentProfile = (data) => profileApi.updateProfile(data);
export const updateFacultyProfile = (data) => profileApi.updateProfile(data);
export const getCourses = () => courseApi.getAllCourses();
export const getAssignments = () => assignmentApi.getAllAssignments();
export const getStudentDashboard = () => dashboardApi.getStudentDashboard();
export const getFacultyDashboard = () => dashboardApi.getFacultyDashboard();
export const getMarks = () => marksApi.getAllMarks();
export const getScores = () => marksApi.getAllMarks();

// ── Stub endpoints (backend not yet implemented — will return 404 gracefully) ──

export const getAttendance = () => api.get("/attendance");
export const getNotifications = () => api.get("/notifications");

// ── EXPORTS for other modules ──────────────────────────────────────────────
// ATTENDANCE
// 📅 ATTENDANCE
export const attendanceApi = {
  // Teacher
  addAttendance: (data) =>
    callApi("/attendance/addAttendance", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAttendance: (data) =>
    callApi("/attendance/updateAttendance", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getAttendanceByCourse: (courseId) =>
    callApi(
      `/attendance/getAttendanceByCourse?courseId=${encodeURIComponent(courseId)}`
    ),

  getCourseStudents: (courseId) =>
    callApi(
      `/attendance/getCourseStudents?courseId=${encodeURIComponent(courseId)}`
    ),

  // Student
  getStudentAttendance: (studentId) =>
    callApi(
      `/attendance/getStudentAttendance?studentId=${encodeURIComponent(studentId)}`
    ),
};
export { BASE_URL };
