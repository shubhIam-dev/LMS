// Faculty Score API Service — all backend calls for faculty score management.
// Builds on top of the existing callApi helper from services/api.js for consistency.
// Every request automatically carries the JWT via callApi.

import { callApi } from "./api";

const BASE = "/faculty/scores";

export const facultyScoreApi = {
  // ── Get all students enrolled in a course with their current scores ──
  getCourseStudents: (courseId) => callApi(`${BASE}/course/${courseId}`),

  // ── Get one student's complete score detail for a course ────────────
  getStudentDetail: (studentId, courseId) =>
    callApi(`${BASE}/student/${studentId}/${courseId}`),

  // ── Create a new score record ───────────────────────────────────────
  createScore: (data) =>
    callApi(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ── Update an existing score record by ID ───────────────────────────
  updateScore: (id, data) =>
    callApi(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ── Delete a score record by ID (optional) ─────────────────────────
  deleteScore: (id) =>
    callApi(`${BASE}/${id}`, {
      method: "DELETE",
    }),
};
