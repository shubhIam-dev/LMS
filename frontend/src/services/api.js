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

// 📞 Helper function to make API calls
// Think of this like a receptionist who handles all calls to the backend
async function callApi(endpoint, options = {}) {
  try {
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
    throw error;
  }
}

// 🔑 Export the token helper so other modules can use it too
export { getToken };

// 👤 USER API — All functions related to students
export const userApi = {
  // 🔐 NEW: Proper JWT login
  // This sends phone + password to the backend, which verifies and returns a token
  loginWithJWT: (phoneNumber, password) => {
    return callApi("/user/login", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, password }),
    });
  },

  // Log in a user by their phone number (OLD way — kept for compatibility)
  login: (phoneNumber) => {
    return callApi(`/user/getUser?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  },

  // Register a new student
  register: (userData) => {
    return callApi("/user/addUser", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
};

// 📚 COURSES API — All functions related to courses
export const courseApi = {
  getAllCourses: () => {
    return callApi("/course/getAllCourses");
  },
  getCourseById: (id) => {
    return callApi(`/course/getCourseById`, {
      method: "GET",
      body: JSON.stringify({ _id: id }),
    });
  },
};

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
};
