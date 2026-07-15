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

function getUserId() {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed._id || null;
    }
    return null;
  } catch {
    return null;
  }
}

function callApi(endpoint, options = {}) {
  const token = getToken();
  return fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }).then(response => {
    return response.text().then(text => {
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      if (!response.ok) throw new Error(data.msg || data || "Something went wrong");
      return data;
    });
  });
}

export const userApi = {
  login: (phoneNumber, password) => {
    return callApi("/user/login", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, password }),
    });
  },
  register: (userData) => {
    return callApi("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
  me: () => callApi(`/user/me?userId=${encodeURIComponent(getUserId())}`),
  addUser: (userData) => {
    return callApi("/user/addUser", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
  addUsers: (usersData) => {
    return callApi("/user/addUsers", {
      method: "POST",
      body: JSON.stringify(usersData),
    });
  },
  getUser: (phoneNumber) => callApi(`/user/getUser?phoneNumber=${encodeURIComponent(phoneNumber)}`),
};

export const courseApi = {
  getAllCourses: () => callApi("/course/getAllCourses"),
  getCourseById: (id) => callApi(`/course/getCourseById?_id=${encodeURIComponent(id)}`),
  addCourse: (data) => callApi("/course/addCourse", { method: "POST", body: JSON.stringify(data) }),
  addCourses: (data) => callApi("/course/addCourses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: (data) => callApi("/course/updateCourseById", { method: "POST", body: JSON.stringify(data) }),
  deleteCourse: (id) => callApi("/course/deleteCourse", { method: "POST", body: JSON.stringify({ _id: id }) }),
  enrollStudent: (courseId, studentId) => callApi("/course/enrollStudent", { method: "POST", body: JSON.stringify({ courseId, studentId }) }),
  getStudents: (courseId) => callApi(`/course/getStudents?courseId=${encodeURIComponent(courseId)}`),
};

export const questionApi = {
  getAll: (filters = {}) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    return callApi(`/questions/getAllQuestions${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => callApi(`/questions/getQuestionById?id=${encodeURIComponent(id)}`),
  add: (data) => callApi("/questions/addQuestion", { method: "POST", body: JSON.stringify(data) }),
  addBulk: (data) => callApi("/questions/addQuestions", { method: "POST", body: JSON.stringify(data) }),
  delete: (id) => callApi("/questions/deleteQuestion", { method: "POST", body: JSON.stringify({ id }) }),
};

export const assignmentApi = {
  getAllAssignments: () => callApi("/assignments/getAllAssignments"),
  getByCourse: (courseId) => callApi(`/assignments/getByCourse?courseId=${encodeURIComponent(courseId)}`),
  getAssignmentById: (id) => callApi(`/assignments/getAssignmentById?id=${encodeURIComponent(id)}`),
  addAssignment: (data) => callApi("/assignments/addAssignment", { method: "POST", body: JSON.stringify(data) }),
  addQuestionsToAssignment: (assignmentId, questionIds) => callApi("/assignments/addQuestionsToAssignment", { method: "POST", body: JSON.stringify({ assignmentId, questionIds }) }),
  deleteAssignment: (id) => callApi("/assignments/deleteAssignment", { method: "POST", body: JSON.stringify({ id }) }),
  reuse: (assignmentId, courseId, dueOn) => callApi("/assignments/reuse", { method: "POST", body: JSON.stringify({ assignmentId, courseId, dueOn }) }),
};

export const submissionApi = {
  submit: (payload) => callApi("/submissions/submit", { method: "POST", body: JSON.stringify(payload) }),
  getByStudent: (studentId) => callApi(`/submissions/getByStudent?studentId=${encodeURIComponent(studentId)}`),
  getByAssignment: (assignmentId) => callApi(`/submissions/getByAssignment?assignmentId=${encodeURIComponent(assignmentId)}`),
  grade: (submissionId) => callApi("/submissions/grade", { method: "POST", body: JSON.stringify({ submissionId }) }),
  gradeManual: (submissionId, perQuestion) => callApi("/submissions/gradeManual", { method: "POST", body: JSON.stringify({ submissionId, perQuestion }) }),
};

export const marksApi = {
  getMarksByStudent: (studentId) => callApi(`/marks/getMarksByStudent?studentId=${encodeURIComponent(studentId)}`),
  getAllMarks: () => callApi("/marks/getAllMarks"),
  addMarks: (data) => callApi("/marks/addMarks", { method: "POST", body: JSON.stringify(data) }),
};

export const profileApi = {
  getProfile: () => callApi(`/api/profile?userId=${encodeURIComponent(getUserId())}`),
  updateProfile: (data) => {
    return callApi("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ ...data, userId: data._id || getUserId() }),
    });
  },
  changePassword: (currentPassword, newPassword) => {
    return callApi("/api/profile/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword, userId: getUserId() }),
    });
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("userId", getUserId());
    const token = getToken();
    const response = await fetch(`${BASE_URL}/api/profile/upload-image`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || "Failed to upload image");
    }
    return data;
  },
};

export { BASE_URL };
