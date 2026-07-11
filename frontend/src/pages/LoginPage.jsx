// LoginPage — the sign-in form.
// Dispatches loginUser() (an async thunk) and reads status/error from Redux.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  loginUser,
  selectAuthError,
  selectAuthStatus,
  selectIsAuthed,
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
  const isLoading = status === "loading";

  // If already logged in (page refresh with saved session), bounce to dashboard.
  useEffect(() => {
    if (isAuthed) navigate("/dashboard", { replace: true });
  }, [isAuthed, navigate]);

  // Clear stale error when the user starts typing again.
  useEffect(() => {
    if (error) dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber, password]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!phoneNumber || !password) return;

    const result = await dispatch(loginUser({ phoneNumber, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard");
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
          Don't have an account? Contact your college administration.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
