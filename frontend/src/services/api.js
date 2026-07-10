// 🌐 API Service - This is like a phonebook for the backend
// It stores all the backend addresses and helps us call them

// The base URL where our backend server is running
// Localhost means it's on our own computer, port 9000 is the door number
const BASE_URL = "http://localhost:9000";

// 📞 Helper function to make API calls
// Think of this like a receptionist who handles all calls to the backend
async function callApi(endpoint, options = {}) {
  try {
    // Make the actual fetch request to the backend
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    // If the server says something went wrong, show the error
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || "Something went wrong");
    }
    // Convert the response to JSON format so we can use it
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error);
    throw error;
  }
}

// 👤 USER API - All functions related to students
export const userApi = {
  // Log in a user by their phone number
  // This asks the backend: "Hey, do we have a student with this phone number?"
  login: (phoneNumber) => {
    // We have to encode the phone number because URLs can't have special characters
    return callApi(`/user/getUser?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  },

  // Register a new student
  // This tells the backend: "Please add this new student to the database"
  register: (userData) => {
    return callApi("/user/addUser", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
};

// 📚 COURSES API - All functions related to courses
export const courseApi = {
  // Get ALL courses from the database
  getAllCourses: () => {
    return callApi("/course/getAllCourses");
  },

  // Get a specific course by its ID
  getCourseById: (id) => {
    return callApi(`/course/getCourseById`, {
      method: "GET",
      body: JSON.stringify({ _id: id }),
    });
  },
};

// 📝 ASSIGNMENTS API - All functions related to assignments
export const assignmentApi = {
  // Get ALL assignments
  getAllAssignments: () => {
    return callApi("/assignments/getAllAssignments");
  },
};

// 📊 MARKS API - All functions related to student marks/grades
export const marksApi = {
  // Get marks for a specific student by their ID
  getMarksByStudent: (studentId) => {
    return callApi(`/marks/getMarksByStudent?studentId=${encodeURIComponent(studentId)}`);
  },

  // Get ALL marks from the database
  getAllMarks: () => {
    return callApi("/marks/getAllMarks");
  },
  getMarksById : () =>{
    
  }
};
