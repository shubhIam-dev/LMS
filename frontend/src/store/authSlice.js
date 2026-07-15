<<<<<<< HEAD
// authSlice — Redux slice that owns "who is logged in"
//
// A "slice" in Redux Toolkit bundles:
//   • initial state
//   • reducers (functions that describe how state changes)
//   • thunks (functions that do async work like calling the API)
//
// Everything auth-related lives here so pages don't have to know
// HOW login works — they just dispatch(loginUser(...)).

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../services/api";

const STORAGE_KEY = "user";

// Read any user we saved to localStorage last time (keeps login sticky
// across refreshes).
function readUserFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
=======
// authSlice — owns "who is logged in" via a JWT.
//
// The login thunk POSTs credentials to /user/login, which returns { token, user }.
// We keep the token (for the Authorization header) and the user (for the UI,
// including their role) in localStorage so a refresh stays logged in.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi, setToken, clearToken } from "../services/api";

const USER_KEY = "user";

function readUserFromStorage() {
  try {
    const raw = localStorage.getItem(USER_KEY);
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

<<<<<<< HEAD
// A thunk = an async action. Dispatching it runs the function body,
// and Redux Toolkit auto-generates .pending / .fulfilled / .rejected
// action types we handle in extraReducers below.
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    // 🆕 Try the new JWT login first
    try {
      const result = await userApi.loginWithJWT(phoneNumber, password);
      // result = { msg, token, user }
      // Save both user data AND token to localStorage
      const userWithToken = { ...result.user, token: result.token };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithToken));
      return userWithToken;
    } catch (jwtError) {
      // If JWT login fails, fall back to the OLD way
      // (This is for backward compatibility with existing users)
      try {
        const userData = await userApi.login(phoneNumber);

        if (typeof userData === "string") {
          return rejectWithValue(userData);
        }

        // Old login: compare password on frontend
        // But some users may already have hashed passwords now!
        // Try comparing directly first, then bcrypt
        if (userData.password !== password) {
          return rejectWithValue("Wrong password! Please try again.");
        }

        const userWithToken = {
          ...userData,
          token: userData.token || null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithToken));
        return userWithToken;
      } catch (oldError) {
        return rejectWithValue(oldError.message || "Login failed");
      }
=======
// POST /user/login → { token, user }. bcrypt comparison happens on the server;
// the frontend never sees or compares password hashes anymore.
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    try {
      const { token, user } = await userApi.login(phoneNumber, password);
      setToken(token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      return rejectWithValue(err.message || "Login failed. Please try again.");
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
    }
  }
);

<<<<<<< HEAD
// 🎭 Read saved view mode from localStorage (persists across refreshes)
function readViewMode() {
  try {
    return localStorage.getItem("viewMode") || null;
  } catch {
    return null;
  }
}

=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: readUserFromStorage(),
<<<<<<< HEAD
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    // 🎭 View mode: 'student' | 'teacher' | null (null = use user's actual role)
    viewMode: readViewMode(),
  },
  reducers: {
    logout(state) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("viewMode");
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.viewMode = null;
=======
    status: "idle",
    error: null,
  },
  reducers: {
    logout(state) {
      clearToken();
      localStorage.removeItem(USER_KEY);
      state.user = null;
      state.status = "idle";
      state.error = null;
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
    },
    clearError(state) {
      state.error = null;
    },
<<<<<<< HEAD
    // 🆕 Update user data in Redux (e.g., after profile edit)
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
    },
    // 🎭 Switch between Student View and Teacher View (for faculty)
    setViewMode(state, action) {
      const mode = action.payload; // 'student' | 'teacher' | null
      state.viewMode = mode;
      if (mode) {
        localStorage.setItem("viewMode", mode);
      } else {
        localStorage.removeItem("viewMode");
      }
    },
=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
<<<<<<< HEAD
        // Reset view mode on fresh login — the selector will set the correct default
        state.viewMode = null;
=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed. Please try again.";
      });
  },
});

<<<<<<< HEAD
export const { logout, clearError, updateUser, setViewMode } = authSlice.actions;

// Selectors — small helpers so components don't reach into state.auth.*
// directly. Keeps refactors easy.
export const selectUser = (s) => s.auth.user;
=======
export const { logout, clearError } = authSlice.actions;

// Selectors
export const selectUser = (s) => s.auth.user;
export const selectRole = (s) => s.auth.user?.role || null;
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
export const selectAuthStatus = (s) => s.auth.status;
export const selectAuthError = (s) => s.auth.error;
export const selectIsAuthed = (s) => Boolean(s.auth.user);

<<<<<<< HEAD
// 🎭 View mode selector — returns the effective view mode
// For students: always 'student'
// For teachers: returns their chosen view mode (defaults to 'teacher')
export const selectViewMode = (s) => {
  const user = s.auth.user;
  const viewMode = s.auth.viewMode;
  if (!user) return null;
  // Students can only see student view
  if (user.role === "student") return "student";
  // Teachers can switch — default to teacher view if no preference saved
  return viewMode || "teacher";
};

=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
export default authSlice.reducer;
