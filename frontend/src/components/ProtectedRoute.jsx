// ProtectedRoute — redirects to the login page if no user is logged in.
// Reads auth state from Redux.

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthed } from "../store/authSlice";

function ProtectedRoute({ children }) {
  const isAuthed = useSelector(selectIsAuthed);
  if (!isAuthed) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
