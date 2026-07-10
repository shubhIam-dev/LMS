// 🛡️ ProtectedRoute - The security guard for our pages
// This component checks if a user is logged in before showing a page.
// If they're not logged in, it sends them to the login page!

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  // Check if user is logged in
  const { user, loading } = useAuth();

  // ⏳ Still checking if user is logged in (just started the app)
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">⏳ Loading...</div>
      </div>
    );
  }

  // 🚫 If no user is logged in, redirect to the login page
  // Navigate is like a security guard saying "You can't go there, go to login first!"
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ User is logged in - show the page they asked for
  return children;
}

export default ProtectedRoute;
