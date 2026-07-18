// ProtectedRoute — gate a page behind authentication and (optionally) roles.
//
//   <ProtectedRoute><Dashboard/></ProtectedRoute>
//   <ProtectedRoute roles={["teacher","superadmin"]}><TeacherPage/></ProtectedRoute>
//
// Not logged in  → redirect to the login page.
// Wrong role     → redirect to the correct role-based dashboard.

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthed, selectRole } from "../store/authSlice";

function ProtectedRoute({ children, roles }) {
  const isAuthed = useSelector(selectIsAuthed);
  const role = useSelector(selectRole);

  if (!isAuthed) return <Navigate to="/" replace />;
  if (roles && roles.length && !roles.includes(role)) {
    // Redirect to appropriate dashboard based on actual role
    if (role === "student") return <Navigate to="/dashboard/student" replace />;
    if (role === "teacher" || role === "superadmin") return <Navigate to="/dashboard/faculty" replace />;
    return <Navigate to="/dashboard/student" replace />;
  }
  return children;
}

export default ProtectedRoute;
