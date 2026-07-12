// App.jsx — top-level routing + layout.
// Auth state now comes from Redux (see src/store/authSlice.js).
// 🆕 Now includes Student Profile (/profile) and Faculty Profile (/faculty-profile) routes!

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Marks from "./pages/Marks";
import StudentProfile from "./pages/StudentProfile";   // 🆕 Student profile page
import FacultyProfile from "./pages/FacultyProfile";   // 🆕 Faculty profile page
import { selectIsAuthed, selectViewMode } from "./store/authSlice";
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

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* 🔑 Public — Login page (anyone can see this) */}
          <Route path="/" element={<LoginPage />} />

          {/* 📊 Protected — Dashboard (must be logged in) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* 📚 Protected — Courses page */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />

          {/* 📝 Protected — Assignments page */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />

          {/* 📈 Protected — Marks page */}
          <Route
            path="/marks"
            element={
              <ProtectedRoute>
                <Marks />
              </ProtectedRoute>
            }
          />

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
