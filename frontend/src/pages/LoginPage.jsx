// LoginPage — the sign-in form.
// Dispatches loginUser() (an async thunk) and reads status/error from Redux.
// On success, redirects to the correct dashboard based on user role.

import { useState, useEffect, useRef } from "react";
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

  // ── Theme toggle on login page ──
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isAuthed = useSelector(selectIsAuthed);
  const role = useSelector(selectRole);
  const isLoading = status === "loading";

  // Purely presentational: tracks the cursor over the login card to drive
  // the 3D tilt effect. Reads/writes only the DOM node via ref — no state,
  // no interaction with auth/session logic.
  const tiltCardRef = useRef(null);
  const reducesMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function handleTiltMove(e) {
    if (reducesMotion) return;
    const card = tiltCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 12;
    const rotX = (0.5 - py) * 12;
    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  function handleTiltLeave() {
    const card = tiltCardRef.current;
    if (!card) return;
    card.style.transform = "rotateX(0deg) rotateY(0deg)";
  }

  // Only redirect when we have a CONFIRMED successful login (status === "succeeded").
  // Without this check, stale user data from localStorage would trigger an immediate
  // redirect with an old/invalid token, causing "Session expired" on the dashboard.
  useEffect(() => {
    if (!isAuthed) return;
    if (status !== "succeeded") return; // ← KEY FIX: ignore stale "idle" state from localStorage
    if (role === "student") {
      navigate("/dashboard/student", { replace: true });
    } else if (role === "superadmin") {
      navigate("/dashboard/admin", { replace: true });
    } else if (role === "teacher") {
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
      } else if (userRole === "superadmin") {
        navigate("/dashboard/admin", { replace: true });
      } else if (userRole === "teacher") {
        navigate("/dashboard/faculty", { replace: true });
      } else {
        navigate("/dashboard/student", { replace: true });
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="panel-horizon"></div>
        <div className="panel-horizon-glow"></div>

        <div className="panel-mark">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10 12 5 2 10l10 5 10-5z" />
            <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
          </svg>
          <span>College_ERP // Portal</span>
        </div>

        <div className="panel-core-wrap">
          <div className="panel-core-glow"></div>
          <div className="panel-core">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10 12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
            </svg>
          </div>
        </div>

        <div className="feature-strip">
          <div className="feature feature--cyan">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <b>Courses</b>
            <div className="feature-bar"><i style={{ width: "78%" }}></i></div>
            <small>12 ACTIVE</small>
          </div>
          <div className="feature feature--magenta">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
            </svg>
            <b>Grades</b>
            <div className="feature-bar"><i style={{ width: "92%" }}></i></div>
            <small>RANK A+</small>
          </div>
          <div className="feature feature--lime">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <b>Attend.</b>
            <div className="feature-bar"><i style={{ width: "96%" }}></i></div>
            <small>96% TERM</small>
          </div>
        </div>

        <div className="panel-copy">
          <div className="panel-eyebrow">
            <span className="pulse-dot"></span> System Online — Registry v2
          </div>
          <h2>
            Everything you&apos;re learning,
            <br />
            <em>rendered live.</em>
          </h2>
          <p>
            Courses, marks, attendance, and the small print in between —
            tracked in real time.
          </p>
        </div>
      </div>

      <div className="login-container">
        {/* ── Theme Toggle (top-right) ── */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid var(--hud-line)",
            background: "var(--panel-x)",
            backdropFilter: "blur(8px)",
            color: "var(--hud-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--cyan)";
            e.currentTarget.style.color = "var(--cyan)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(0,229,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--hud-line)";
            e.currentTarget.style.color = "var(--hud-muted)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            {theme === "dark" ? (
              <>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </>
            ) : (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            )}
          </svg>
        </button>

        <div
          className="tilt-wrap"
          onMouseMove={handleTiltMove}
          onMouseLeave={handleTiltLeave}
        >
          <div className="login-card" ref={tiltCardRef}>
            <div className="card-sweep"></div>

            <div className="login-header">
              <div className="login-badge">
                <span>Access Terminal</span>
                <span className="badge-status">
                  <span className="pulse-dot"></span> Online
                </span>
              </div>
              <h1>Welcome back</h1>
              <p>Sign in to continue to your dashboard.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="field-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="field-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </form>

            <p className="login-footer">
              Don&apos;t have an account? Contact your college administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
