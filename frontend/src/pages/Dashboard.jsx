// 📊 Dashboard - The home page after login
// This is like the main notice board of the college - shows everything at a glance!

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { courseApi, assignmentApi } from "../services/api";
import { Link } from "react-router-dom";

function Dashboard() {
  // Get the currently logged-in user's info
  const { user } = useAuth();

  // State to store data we fetch from the backend
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📥 When this page loads, fetch all the data from the backend
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch courses and assignments AT THE SAME TIME (parallel)
        // Promise.all means "wait for both of these to finish"
        const [coursesData, assignmentsData] = await Promise.all([
          courseApi.getAllCourses(),
          assignmentApi.getAllAssignments(),
        ]);

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Show a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">⏳ Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* 👋 Welcome section */}
      <div className="welcome-section">
        <h1>👋 Welcome, {user?.name || "Student"}!</h1>
        <p>Here's your academic overview at a glance.</p>
      </div>

      {/* 📊 Stats Cards - like a quick report card */}
      <div className="stats-grid">
        <div className="stat-card courses-stat">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Total Courses</p>
          </div>
        </div>

        <div className="stat-card assignments-stat">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{assignments.length}</h3>
            <p>Assignments</p>
          </div>
        </div>

        <div className="stat-card marks-stat">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>View</h3>
            <p>Your Marks</p>
          </div>
        </div>

        <div className="stat-card profile-stat">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>{user?.email || "N/A"}</h3>
            <p>Email</p>
          </div>
        </div>
      </div>

      {/* 📋 Quick Links - shortcuts to important pages */}
      <div className="quick-links">
        <h2>🔗 Quick Links</h2>
        <div className="links-grid">
          <Link to="/courses" className="quick-link-card">
            <span className="link-icon">📚</span>
            <span className="link-text">View Courses</span>
            <span className="link-arrow">→</span>
          </Link>

          <Link to="/assignments" className="quick-link-card">
            <span className="link-icon">📝</span>
            <span className="link-text">View Assignments</span>
            <span className="link-arrow">→</span>
          </Link>

          <Link to="/marks" className="quick-link-card">
            <span className="link-icon">📊</span>
            <span className="link-text">Check Marks</span>
            <span className="link-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
