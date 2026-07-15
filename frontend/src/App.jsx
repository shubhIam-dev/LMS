// App.jsx — top-level routing + layout.
// Auth state now comes from Redux (see src/store/authSlice.js).
<<<<<<< HEAD
// 🆕 Now includes Student Profile (/profile) and Faculty Profile (/faculty-profile) routes!
=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Marks from "./pages/Marks";
<<<<<<< HEAD
import StudentProfile from "./pages/StudentProfile";   // 🆕 Student profile page
import FacultyProfile from "./pages/FacultyProfile";   // 🆕 Faculty profile page
import { selectIsAuthed, selectViewMode } from "./store/authSlice";
=======
import Manage from "./pages/Manage";
import AssignmentDetail from "./pages/AssignmentDetail";
import { selectIsAuthed } from "./store/authSlice";
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
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

<<<<<<< HEAD
// 🎭 ProfileRoute — redirects to student or faculty profile based on view mode
function ProfileRoute() {
  const viewMode = useSelector(selectViewMode);
  if (viewMode === "teacher") {
    return (
      <ProtectedRoute>
        <FacultyProfile />
      </ProtectedRoute>
    );
  }
  return (
    <ProtectedRoute>
      <StudentProfile />
    </ProtectedRoute>
  );
}

=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
<<<<<<< HEAD
          {/* 🔑 Public — Login page (anyone can see this) */}
          <Route path="/" element={<LoginPage />} />

          {/* 📊 Protected — Dashboard (must be logged in) */}
=======
          <Route path="/" element={<LoginPage />} />
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD

          {/* 📚 Protected — Courses page */}
=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD

          {/* 📝 Protected — Assignments page */}
=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD

          {/* 📈 Protected — Marks page */}
=======
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
          <Route
            path="/marks"
            element={
              <ProtectedRoute>
                <Marks />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD

          {/* 👤 Protected — Profile page (adapts to view mode!) */}
          <Route
            path="/profile"
            element={<ProfileRoute />}
          />

          {/* 👨‍🏫 Protected — Faculty Profile page (direct access) */}
          <Route
            path="/faculty-profile"
            element={
              <ProtectedRoute>
                <FacultyProfile />
              </ProtectedRoute>
            }
          />

          {/* 🚫 Catch-all — Any unknown URL goes to login */}
=======
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
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
