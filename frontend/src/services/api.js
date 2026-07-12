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
};

// 📚 COURSES
export const courseApi = {
  getAllCourses: () => callApi("/course/getAllCourses"),
  getCourseById: (id) => callApi(`/course/getCourseById?_id=${encodeURIComponent(id)}`),
};

// 📝 ASSIGNMENTS
export const assignmentApi = {
  getAllAssignments: () => callApi("/assignments/getAllAssignments"),
};

// 📊 MARKS
export const marksApi = {
  getMarksByStudent: (studentId) =>
    callApi(`/marks/getMarksByStudent?studentId=${encodeURIComponent(studentId)}`),
  getAllMarks: () => callApi("/marks/getAllMarks"),
};
