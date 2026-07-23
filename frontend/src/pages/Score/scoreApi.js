// Score API Service — all backend calls for the Score module.
// Reuses the existing callApi helper from services/api.js for consistency.

// Uses fetch directly with JWT auth headers (same pattern as services/api.js)
// and BASE_URL config. We build on top of it using a thin wrapper.
const BASE = "/score";

async function callScore(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const BASE_URL = "https://lms-591n.vercel.app";

  const res = await fetch(`${BASE_URL}${BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let msg = "Something went wrong";
    try {
      const err = await res.json();
      msg = err.msg || msg;
    } catch {
      /* non-JSON */
    }
    throw new Error(msg);
  }
  return res.json();
}

// ── Public API ───────────────────────────────────────────────────

export const scoreApi = {
  // Get all scores for a student (overview — one per course)
  getByStudent: (studentId) =>
    callScore(`/getByStudent?studentId=${encodeURIComponent(studentId)}`),

  // Get detailed score for one student + one course
  getByCourse: (studentId, courseId) =>
    callScore(
      `/getByCourse?studentId=${encodeURIComponent(studentId)}&courseId=${encodeURIComponent(courseId)}`
    ),

  // Create a new score record (staff only)
  create: (data) =>
    callScore("/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update an existing score record (staff only)
  update: (data) =>
    callScore("/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Update a specific component inside a score (staff only)
  updateComponent: (data) =>
    callScore("/updateComponent", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
