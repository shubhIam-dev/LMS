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
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// A thunk = an async action. Dispatching it runs the function body,
// and Redux Toolkit auto-generates .pending / .fulfilled / .rejected
// action types we handle in extraReducers below.
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    const userData = await userApi.login(phoneNumber);

    // The backend returns a plain string "User not found" instead of a
    // proper error. Guard against that.
    if (typeof userData === "string") {
      return rejectWithValue(userData);
    }
    if (userData.password !== password) {
      return rejectWithValue("Wrong password! Please try again.");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return userData;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: readUserFromStorage(),
    status: "idle",   // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    logout(state) {
      localStorage.removeItem(STORAGE_KEY);
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed. Please try again.";
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// Selectors — small helpers so components don't reach into state.auth.*
// directly. Keeps refactors easy.
export const selectUser = (s) => s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
export const selectAuthError = (s) => s.auth.error;
export const selectIsAuthed = (s) => Boolean(s.auth.user);

export default authSlice.reducer;
