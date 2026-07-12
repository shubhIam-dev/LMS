// 👨‍🏫 FacultyProfile — Your Professor/Teacher Profile Page
//
// Teachers need a different kind of profile! While students show their
// academic info (year, semester, batch), faculty members show their
// professional info (specialization, qualifications, courses they teach).
//
// 💡 Think of it like this:
//    • Student Profile = "What I'm studying"
//    • Faculty Profile = "What I'm teaching & my qualifications"
//
// Everything works the same way as the student profile:
//    • 👁️ View your info
//    • ✏️ Edit your profile
//    • 📸 Upload a photo
//    • 🔑 Change your password

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { profileApi, BASE_URL } from "../services/api";
import { updateUser } from "../store/authSlice";

function FacultyProfile() {
  const dispatch = useDispatch();

  // 📦 State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
  // 📥 LOAD PROFILE
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
  // ✏️ INPUT HANDLERS
  // ============================================================
  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }

  // ============================================================
  // 💾 SAVE PROFILE
  // ============================================================
  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Only send fields that make sense for a teacher
      const facultyData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        currentAddress: profile.currentAddress,
        permanentAddress: profile.permanentAddress,
        department: profile.department,
        specialization: profile.specialization,
        qualification: profile.qualification,
      };

      const result = await profileApi.updateProfile(facultyData);
      if (result.user) {
        setProfile(result.user);
        // 🔄 Sync back to Redux + localStorage so the sidebar updates
        dispatch(updateUser(result.user));
      }
      setSuccess("✅ " + (result.msg || "Profile updated!"));
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // ↩️ CANCEL
  // ============================================================
  function handleCancel() {
    setIsEditing(false);
    fetchProfile();
    setError("");
  }

  // ============================================================
  // 📸 UPLOAD IMAGE
  // ============================================================
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

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
      setError("Failed: " + err.message);
    }
  }

  // ============================================================
  // ⏳ LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">Loading your profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>Profile Not Found</h3>
          <p>{error || "Could not load your profile."}</p>
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
          <em>Faculty</em> Profile
        </h1>
        <p>Your professional profile — qualifications, specialization, and contact info.</p>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* ================================================== */}
      {/* 📇 LEFT SIDE — Photo Card                          */}
      {/* ================================================== */}
      <div className="profile-layout">
        <div className="profile-side-card">
          {/* 🖼️ Photo */}
          <div className="profile-photo-section">
            <div className="profile-photo-wrapper">
              {profile.profileImage ? (
                <img
                  src={`${BASE_URL}${profile.profileImage}`}
                  alt={profile.name}
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo-placeholder faculty">
                  {profile.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
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
            <p className="profile-role-badge faculty">
              👨‍🏫 {profile.role === "teacher" ? "Faculty" : "Staff"}
            </p>
          </div>

          {/* Quick Info */}
          <div className="profile-quick-info">
            <div className="quick-info-item">
              <span className="quick-info-label">Department</span>
              <span className="quick-info-value">
                {profile.department || "N/A"}
              </span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Specialization</span>
              <span className="quick-info-value">
                {profile.specialization || "N/A"}
              </span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Qualification</span>
              <span className="quick-info-value">
                {profile.qualification || "N/A"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
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
        {/* 📋 RIGHT SIDE — Info Cards                         */}
        {/* ================================================== */}
        <div className="profile-main-cards">
          {/* Password Change */}
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
                    placeholder="Enter current password"
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
                    placeholder="Min 6 characters"
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
                    placeholder="Re-enter new password"
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

          {/* 👤 Personal Info */}
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
                    />
                  ) : (
                    <p className="field-value">{profile.email || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="field-value">{profile.phone || profile.phoneNumber || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Gender</label>
                  {isEditing ? (
                    <select name="gender" value={profile.gender || ""} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="field-value">{profile.gender || "N/A"}</p>
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
              </div>
            </div>
          </div>

          {/* 🎓 Professional Info */}
          <div className="profile-card">
            <div className="card-header">
              <h3>🎓 Professional Information</h3>
              {isEditing && <span className="editing-badge">Editing</span>}
            </div>
            <div className="card-body">
              <div className="info-grid">
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
                  <label>Specialization</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="specialization"
                      value={profile.specialization || ""}
                      onChange={handleChange}
                      placeholder="e.g. Artificial Intelligence"
                    />
                  ) : (
                    <p className="field-value">{profile.specialization || "N/A"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Qualification</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="qualification"
                      value={profile.qualification || ""}
                      onChange={handleChange}
                      placeholder="e.g. Ph.D., M.Tech"
                    />
                  ) : (
                    <p className="field-value">{profile.qualification || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🏠 Address */}
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
                      rows={3}
                    />
                  ) : (
                    <p className="field-value">{profile.currentAddress || "Not provided"}</p>
                  )}
                </div>
                <div className="info-field">
                  <label>Permanent Address</label>
                  {isEditing ? (
                    <textarea
                      name="permanentAddress"
                      value={profile.permanentAddress || ""}
                      onChange={handleChange}
                      rows={3}
                    />
                  ) : (
                    <p className="field-value">{profile.permanentAddress || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🗓️ Account Info */}
          <div className="profile-card">
            <div className="card-header">
              <h3>🗓️ Account Information</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-field">
                  <label>Email</label>
                  <p className="field-value">{profile.email || "N/A"}</p>
                </div>
                <div className="info-field">
                  <label>Role</label>
                  <p className="field-value role-badge">👨‍🏫 Faculty</p>
                </div>
                <div className="info-field">
                  <label>Member Since</label>
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
              </div>
            </div>
          </div>

          {/* Save / Cancel */}
          {isEditing && (
            <div className="profile-edit-actions">
              <button className="btn btn-primary btn-large" onClick={handleSave} disabled={saving}>
                {saving ? "⏳ Saving..." : "💾 Save Changes"}
              </button>
              <button className="btn btn-outline btn-large" onClick={handleCancel} disabled={saving}>
                ↩️ Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacultyProfile;
