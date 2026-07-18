// LoginPage — the sign-in form.
// Dispatches loginUser() (an async thunk) and reads status/error from Redux.
// On success, redirects to the correct dashboard based on user role.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  loginUser,
  logout,
  selectAuthError,
  selectAuthStatus,
  selectIsAuthed,
  selectRole,
  clearError,
} from "../store/authSlice";

function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isAuthed = useSelector(selectIsAuthed);
  const role = useSelector(selectRole);
  const isLoading = status === "loading";

  // Only redirect when we have a CONFIRMED successful login (status === "succeeded").
  // Without this check, stale user data from localStorage would trigger an immediate
  // redirect with an old/invalid token, causing "Session expired" on the dashboard.
  useEffect(() => {
    if (!isAuthed) return;
    if (status !== "succeeded") return; // ← KEY FIX: ignore stale "idle" state from localStorage
    if (role === "student") {
      navigate("/dashboard/student", { replace: true });
    } else if (role === "teacher" || role === "superadmin") {
      navigate("/dashboard/faculty", { replace: true });
    } else {
      navigate("/dashboard/student", { replace: true });
    }
  }, [isAuthed, role, navigate, status]);

  // Clear stale error when the user starts typing again.
  useEffect(() => {
    if (error) dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber, password]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!phoneNumber || !password) return;

    // Clear stale auth state before attempting a fresh login.
    // This prevents old/invalid tokens from being sent on subsequent API calls
    // and ensures the Redux store starts from a clean state.
    dispatch(logout());

    const result = await dispatch(loginUser({ phoneNumber, password }));
    if (loginUser.fulfilled.match(result)) {
      // Redirect based on role — the useEffect above will handle this
      // once status changes to "succeeded"
      const userRole = result.payload?.role;
      if (userRole === "student") {
        navigate("/dashboard/student", { replace: true });
      } else if (userRole === "teacher" || userRole === "superadmin") {
        navigate("/dashboard/faculty", { replace: true });
      } else {
        navigate("/dashboard/student", { replace: true });
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon"></div>
          <h1>College ERP Portal</h1>
          <p>Welcome back. Sign in to continue.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="login-footer">
          Don&apos;t have an account? Contact your college administration.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
