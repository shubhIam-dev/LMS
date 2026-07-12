// 🧑‍🎓 StudentProfile — Your Personal Profile Page
//
// This is like your student ID card, but DIGITAL and BETTER!
// You can:
//   • 👁️ View all your info (personal, academic, guardian, address)
//   • ✏️ Edit your profile (click "Edit Profile" and change anything)
//   • 📸 Upload a profile picture
//   • 🔑 Change your password
//
// 📖 How it works:
//    1. When the page loads, it calls the backend: "Hey, give me my profile!"
//    2. The backend looks up the user by the JWT token
//    3. All the data comes back and we display it in nice cards
//    4. When you click "Edit", the fields become editable
//    5. Click "Save" and we send the changes back to the backend

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { profileApi, BASE_URL } from "../services/api";
import { updateUser } from "../store/authSlice";

function StudentProfile() {
  // 📡 Redux dispatch — for sending updates back to the global store
  const dispatch = useDispatch();

  // 📦 State to store ALL profile data
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✏️ Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // 🔑 Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 📸 File upload ref
  const fileInputRef = useRef(null);

  // ============================================================
  // 📥 FETCH PROFILE — Load data when the page mounts
  // ============================================================
  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile. " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ✏️ HANDLE INPUT CHANGE — Update form data when user types
  // ============================================================
  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }

  // ============================================================
  // 💾 SAVE PROFILE — Send updated data to the backend
  // ============================================================
  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await profileApi.updateProfile(profile);

      if (result.user) {
        setProfile(result.user);
        // 🔄 Sync the updated profile back to Redux + localStorage
        // This ensures the sidebar shows your new name/email right away
        dispatch(updateUser(result.user));
      }

      setSuccess("✅ " + result.msg || "Profile updated successfully!");
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // ↩️ CANCEL EDIT — Revert all changes and go back to view mode
  // ============================================================
  function handleCancel() {
    setIsEditing(false);
    fetchProfile(); // Reload original data
    setError("");
  }

  // ============================================================
  // 📸 UPLOAD IMAGE — Let user pick and upload a profile picture
  // ============================================================
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Quick validation on the frontend
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      const result = await profileApi.uploadImage(file);
      setProfile((prev) => ({ ...prev, profileImage: result.imageUrl }));
      setSuccess("✅ Profile picture updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to upload image: " + err.message);
    }
  }

  // ============================================================
  // 🔑 CHANGE PASSWORD
  // ============================================================
  async function handlePasswordChange() {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match!");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await profileApi.changePassword(currentPassword, newPassword);
      setSuccess("✅ Password changed successfully!");
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to change password: " + err.message);
    }
  }

  // ============================================================
  // ⏳ LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">
          <div className="spinner-dot"></div>
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // ❌ ERROR STATE — If user not found or server error
  // ============================================================
  if (!profile) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>Profile Not Found</h3>
          <p>{error || "Could not load your profile. Please try again."}</p>
          <button className="btn btn-primary" onClick={fetchProfile}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 🎨 FULL PROFILE PAGE
  // ============================================================
  return (
    <div className="page-content profile-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>
          <em>My</em> Profile
        </h1>
        <p>View and manage your personal and academic information.</p>
      </div>

      {/* 🔔 Success / Error Messages */}
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* ================================================== */}
      {/* 📇 LEFT SIDE — Profile Card (Photo + Quick Info)   */}
      {/* ================================================== */}
      <div className="profile-layout">
        <div className="profile-side-card">
          {/* 🖼️ Profile Photo */}
          <div className="profile-photo-section">
            <div className="profile-photo-wrapper">
              {profile.profileImage ? (
                <img
                  src={`${BASE_URL}${profile.profileImage}`}
                  alt={profile.name}
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo-placeholder">
                  {profile.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              {/* Camera icon overlay for upload */}
              <button
                className="photo-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo"
              >
                📸
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>
            <h2 className="profile-name">{profile.name || "N/A"}</h2>
            <p className="profile-role-badge">
              {profile.role === "student" ? "🎓 Student" : "👨‍🏫 Faculty"}
            </p>
          </div>

          {/* 🆔 Quick Info */}
          <div className="profile-quick-info">
            <div className="quick-info-item">
              <span className="quick-info-label">Student ID</span>
              <span className="quick-info-value">
                {profile.studentId || "Not assigned"}
              </span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Department</span>
              <span className="quick-info-value">
                {profile.department || "N/A"}
              </span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Year</span>
              <span className="quick-info-value">
                {profile.year || "N/A"}
              </span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Semester</span>
              <span className="quick-info-value">
                {profile.semester || "N/A"}
              </span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Batch</span>
              <span className="quick-info-value">
                {profile.batch || "N/A"}
              </span>
            </div>
          </div>

          {/* 🎯 Action Buttons */}
          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsEditing(!isEditing);
                setShowPasswordForm(false);
              }}
            >
              {isEditing ? "✕ Cancel" : "✏️ Edit Profile"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              📸 Upload Photo
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setIsEditing(false);
              }}
            >
              🔑 {showPasswordForm ? "✕ Close" : "Change Password"}
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* 📋 RIGHT SIDE — Detailed Information Cards          */}
        {/* ================================================== */}
        <div className="profile-main-cards">
          {/* 🔑 Password Change Form (shown when toggled) */}
          {showPasswordForm && (
            <div className="profile-card password-card">
              <div className="card-header">
                <h3>🔑 Change Password</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter your current password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter your new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                  />
                </div>
                <button className="btn btn-primary" onClick={handlePasswordChange}>
                  🔒 Update Password
                </button>
              </div>
            </div>
          )}

          {/* 👤 Personal Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>👤 Personal Information</h3>
              {isEditing && <span className="editing-badge">Editing</span>}
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-field">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name || ""}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  ) : (
                    <p className="field-value">{profile.name || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email || ""}
                      onChange={handleChange}
                      placeholder="your.email@college.edu"
                    />
                  ) : (
                    <p className="field-value">{profile.email || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleChange}
                      placeholder="Phone number"
                    />
                  ) : (
                    <p className="field-value">{profile.phone || profile.phoneNumber || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profile.dateOfBirth || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="field-value">
                      {profile.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  )}
                </div>
                <div className="info-field">
                  <label>Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={profile.gender || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="field-value">{profile.gender || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 📚 Academic Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>📚 Academic Information</h3>
              {isEditing && <span className="editing-badge">Editing</span>}
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-field">
                  <label>Student ID</label>
                  <p className="field-value mono">{profile.studentId || "Not assigned"}</p>
                </div>
                <div className="info-field">
                  <label>Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={profile.department || ""}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                    />
                  ) : (
                    <p className="field-value">{profile.department || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Course</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="course"
                      value={profile.course || ""}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech"
                    />
                  ) : (
                    <p className="field-value">{profile.course || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Branch</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="branch"
                      value={profile.branch || ""}
                      onChange={handleChange}
                      placeholder="e.g. CSE"
                    />
                  ) : (
                    <p className="field-value">{profile.branch || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Year</label>
                  {isEditing ? (
                    <select
                      name="year"
                      value={profile.year || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  ) : (
                    <p className="field-value">{profile.year || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Semester</label>
                  {isEditing ? (
                    <select
                      name="semester"
                      value={profile.semester || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select semester</option>
                      <option value="Sem 1">Sem 1</option>
                      <option value="Sem 2">Sem 2</option>
                      <option value="Sem 3">Sem 3</option>
                      <option value="Sem 4">Sem 4</option>
                      <option value="Sem 5">Sem 5</option>
                      <option value="Sem 6">Sem 6</option>
                      <option value="Sem 7">Sem 7</option>
                      <option value="Sem 8">Sem 8</option>
                    </select>
                  ) : (
                    <p className="field-value">{profile.semester || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Section</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="section"
                      value={profile.section || ""}
                      onChange={handleChange}
                      placeholder="e.g. A, B"
                    />
                  ) : (
                    <p className="field-value">{profile.section || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Batch</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="batch"
                      value={profile.batch || ""}
                      onChange={handleChange}
                      placeholder="e.g. 2024-2028"
                    />
                  ) : (
                    <p className="field-value">{profile.batch || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🏠 Address Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>🏠 Address</h3>
              {isEditing && <span className="editing-badge">Editing</span>}
            </div>
            <div className="card-body">
              <div className="info-grid two-col">
                <div className="info-field">
                  <label>Current Address</label>
                  {isEditing ? (
                    <textarea
                      name="currentAddress"
                      value={profile.currentAddress || ""}
                      onChange={handleChange}
                      placeholder="Your current/local address"
                      rows={3}
                    />
                  ) : (
                    <p className="field-value">
                      {profile.currentAddress || "Not provided"}
                    </p>
                  )}
                </div>
                <div className="info-field">
                  <label>Permanent Address</label>
                  {isEditing ? (
                    <textarea
                      name="permanentAddress"
                      value={profile.permanentAddress || ""}
                      onChange={handleChange}
                      placeholder="Your permanent/home address"
                      rows={3}
                    />
                  ) : (
                    <p className="field-value">
                      {profile.permanentAddress || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 👨‍👩‍👧 Guardian Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>👨‍👩‍👧 Guardian Information</h3>
              {isEditing && <span className="editing-badge">Editing</span>}
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-field">
                  <label>Father's Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fatherName"
                      value={profile.fatherName || ""}
                      onChange={handleChange}
                      placeholder="Father's full name"
                    />
                  ) : (
                    <p className="field-value">{profile.fatherName || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Mother's Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="motherName"
                      value={profile.motherName || ""}
                      onChange={handleChange}
                      placeholder="Mother's full name"
                    />
                  ) : (
                    <p className="field-value">{profile.motherName || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Guardian Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="guardianPhone"
                      value={profile.guardianPhone || ""}
                      onChange={handleChange}
                      placeholder="Guardian's phone number"
                    />
                  ) : (
                    <p className="field-value">
                      {profile.guardianPhone || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🗓️ Account Information (Read-only) */}
          <div className="profile-card">
            <div className="card-header">
              <h3>🗓️ Account Information</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-field">
                  <label>Username / Email</label>
                  <p className="field-value">{profile.email || "N/A"}</p>
                </div>
                <div className="info-field">
                  <label>Role</label>
                  <p className="field-value role-badge">
                    {profile.role === "student" ? "🎓 Student" : "👨‍🏫 Faculty"}
                  </p>
                </div>
                <div className="info-field">
                  <label>Account Created</label>
                  <p className="field-value">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div className="info-field">
                  <label>Last Updated</label>
                  <p className="field-value">
                    {profile.updatedAt
                      ? new Date(profile.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ✏️ Edit Mode: Save / Cancel Buttons */}
          {isEditing && (
            <div className="profile-edit-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "⏳ Saving..." : "💾 Save Changes"}
              </button>
              <button
                className="btn btn-outline btn-large"
                onClick={handleCancel}
                disabled={saving}
              >
                ↩️ Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
