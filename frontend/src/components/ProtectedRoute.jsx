<<<<<<< HEAD
// ProtectedRoute — redirects to the login page if no user is logged in.
// Reads auth state from Redux.

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthed } from "../store/authSlice";

function ProtectedRoute({ children }) {
  const isAuthed = useSelector(selectIsAuthed);
  if (!isAuthed) return <Navigate to="/" replace />;
=======
// ProtectedRoute — gate a page behind authentication and (optionally) roles.
//
//   <ProtectedRoute><Dashboard/></ProtectedRoute>
//   <ProtectedRoute roles={["teacher","superadmin"]}><TeacherPage/></ProtectedRoute>
//
// Not logged in  → redirect to the login page.
// Wrong role     → redirect to the dashboard (they're authed, just not allowed).

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthed, selectRole } from "../store/authSlice";

function ProtectedRoute({ children, roles }) {
  const isAuthed = useSelector(selectIsAuthed);
  const role = useSelector(selectRole);

  if (!isAuthed) return <Navigate to="/" replace />;
  if (roles && roles.length && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
  return children;
}

export default ProtectedRoute;
