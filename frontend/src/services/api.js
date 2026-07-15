// 🌐 API Service — one place for every backend call.
// All requests automatically carry the JWT (if we have one) so the backend's
// authenticate/authorize middleware lets them through.

const BASE_URL = "http://localhost:9000";
const TOKEN_KEY = "token";

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

// 👤 AUTH / USER
export const userApi = {
  // Log in with phone + password → { token, user }
  login: (phoneNumber, password) => {
    return callApi("/user/login", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, password }),
    });
  },

  // Self-registration (always creates a student) → { token, user }
  register: (userData) => {
    return callApi("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Re-hydrate the current user from the token on app start.
  me: () => callApi("/user/me"),

  // Superadmin: create a teacher / superadmin / student.
  adminCreateUser: (userData) => {
    return callApi("/user/adminCreateUser", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Staff: every student in the system (for enrolling into a course).
  getStudents: () => callApi("/user/students"),
};

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
};
