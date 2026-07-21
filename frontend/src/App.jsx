// App.jsx — top-level routing + layout.
// Auth state comes from Redux (see src/store/authSlice.js).

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Assignments from "./pages/Assignments";
import Marks from "./pages/Marks";
import Manage from "./pages/Manage";
import AssignmentDetail from "./pages/AssignmentDetail";
import { selectIsAuthed, selectRole } from "./store/authSlice";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentProfile from "./pages/StudentProfile";
import FacultyProfile from "./pages/FacultyProfile";
import AttendanceSection from "./pages/AttendanceSection";
import "./App.css";

function Layout({ children }) {
  const isAuthed = useSelector(selectIsAuthed);

  return (
    <div className={`app-layout ${isAuthed ? "has-sidebar" : ""}`}>
      {isAuthed && <Sidebar />}
      <main className="main-content">{children}</main>
    </div>
  );
}

function RoleRedirect() {
  const isAuthed = useSelector(selectIsAuthed);
  const role = useSelector(selectRole);

  if (!isAuthed) return <Navigate to="/" replace />;
  if (role === "student") return <Navigate to="/dashboard/student" replace />;
  if (role === "teacher" || role === "superadmin") return <Navigate to="/dashboard/faculty" replace />;
  return <Navigate to="/dashboard/student" replace />;
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* ── Primary Student Routes ── */}
          {/* Faculty can also view a student's dashboard via /dashboard/student/:studentId */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student/:studentId"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/student"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
           <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendanceSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/student/:studentId"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* ── Primary Faculty Routes ── */}
          <Route
            path="/dashboard/faculty"
            element={
              <ProtectedRoute>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/faculty"
            element={
              <ProtectedRoute>
                <FacultyProfile />
              </ProtectedRoute>
            }
          />

          {/* ── Legacy redirects (old route pattern) ── */}
          <Route path="/student/dashboard" element={<Navigate to="/dashboard/student" replace />} />
          <Route path="/student/profile" element={<Navigate to="/profile/student" replace />} />
          <Route path="/faculty/dashboard" element={<Navigate to="/dashboard/faculty" replace />} />
          <Route path="/faculty/profile" element={<Navigate to="/profile/faculty" replace />} />

          {/* ── Old generic dashboard (redirects to role-specific) ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleRedirect />
              </ProtectedRoute>
            }
          />

          {/* ── Other Pages ── */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marks"
            element={
              <ProtectedRoute>
                <Marks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/:id"
            element={
              <ProtectedRoute>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage"
            element={
              <ProtectedRoute roles={["teacher", "superadmin"]}>
                <Manage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
