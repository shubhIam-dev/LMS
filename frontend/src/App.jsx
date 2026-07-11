// App.jsx - The main brain of our application
// This is like the central control room that decides what to show and when!

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Marks from "./pages/Marks";
import "./App.css";

// Layout component - wraps pages with the sidebar when logged in
function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {/* Show sidebar only if user is logged in */}
      {user && <Sidebar />}
      {/* Main content area */}
      <main className="main-content">{children}</main>
    </div>
  );
}

// Main App component with all routes
function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Login page - shown when not logged in */}
            <Route path="/" element={<LoginPage />} />

            {/* Protected pages - need to be logged in to see these */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Courses />
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

            {/* If someone types a wrong URL, send them to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
