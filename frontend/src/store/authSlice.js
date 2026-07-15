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
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

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
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: readUserFromStorage(),
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

// Selectors
export const selectUser = (s) => s.auth.user;
export const selectRole = (s) => s.auth.user?.role || null;
export const selectAuthStatus = (s) => s.auth.status;
export const selectAuthError = (s) => s.auth.error;
export const selectIsAuthed = (s) => Boolean(s.auth.user);

export default authSlice.reducer;
