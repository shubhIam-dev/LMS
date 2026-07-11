// AuthContext - This manages who is logged in
// Think of this like a security guard that remembers who you are
// once you've shown your ID (logged in)

import { createContext, useContext, useState, useEffect } from "react";
import { userApi } from "../services/api";

// Create the context (like creating a new "security checkpoint" system)
const AuthContext = createContext(null);

// This component wraps our entire app and provides login/logout functionality
// to all the pages inside it
export function AuthProvider({ children }) {
  // State to store the currently logged-in user (null means no one is logged in)
  const [user, setUser] = useState(null);
  // State to track if we're loading (checking if user was already logged in)
  const [loading, setLoading] = useState(true);

  // When the app starts, check if user data exists in localStorage
  // localStorage is like a small storage box in the browser that remembers stuff
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      // If we find saved user data, restore it (log them back in automatically)
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function - verifies user credentials and logs them in
  const login = async (phoneNumber, password) => {
    try {
      // Ask the backend: "Is there a student with this phone number?"
      const userData = await userApi.login(phoneNumber);

      // If user is found as a string, that means error
      if (typeof userData === "string") {
        throw new Error(userData);
      }

      // Check if the password matches
      if (userData.password !== password) {
        throw new Error("Wrong password! Please try again.");
      }

      // Save user info in localStorage so they stay logged in even after refresh
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function - clears user data and logs them out
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Everything we provide to other components
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook - a shortcut to use auth in any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
