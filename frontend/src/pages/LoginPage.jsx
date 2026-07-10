// LoginPage - The first screen students see
// This is like the main gate of the college - everyone has to enter through here!

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  // State for the form inputs
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get the login function from our AuthContext
  const { login } = useAuth();
  // useNavigate is like a GPS - it helps us go to different pages
  const navigate = useNavigate();

  // When the user clicks the login button
  const handleLogin = async (e) => {
    e.preventDefault(); // Stop the form from refreshing the page

    // Basic validation - make sure fields aren't empty
    if (!phoneNumber || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    // Try to log in using our auth system
    const result = await login(phoneNumber, password);

    if (result.success) {
      // Success! Send them to the dashboard
      navigate("/dashboard");
    } else {
      // Failed - show the error message
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* College branding at the top */}
        <div className="login-header">
          <div className="login-icon"></div>
          <h1>College ERP Portal</h1>
          <p>Welcome back! Please sign in to continue.</p>
        </div>

        {/* Error message (only shows if there's an error) */}
        {error && <div className="error-message">{error}</div>}

        {/* Login form */}
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

        {/* Help text for new users */}
        <p className="login-footer">
          Don't have an account? Contact your college administration.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
