// FacultyProfile — Your Professor/Teacher Profile Page
//
// Teachers need a different kind of profile! While students show their
// academic info (year, semester, batch), faculty members show their
// professional info (specialization, qualifications, courses they teach).
//
// Think of it like this:
//    • Student Profile = "What I'm studying"
//    • Faculty Profile = "What I'm teaching & my qualifications"
//
// Everything works the same way as the student profile:
//    • View your info
//    • Edit your profile
//    • Upload a photo
//    • Change your password

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { profileApi, BASE_URL } from "../services/api";
import { updateUser } from "../store/authSlice";
import SKILLS_LIST from "../data/skillsList";
import FIELD_OF_STUDY_LIST from "../data/fieldOfStudyList";

// Helper component for displaying/editing a single social link field
function SocialLinkInput({ label, name, value, isEditing, onChange, placeholder }) {
  if (isEditing) {
    return (
      <div className="info-field">
        <label>{label}</label>
        <input
          type="url"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    );
  }

  if (!value) return null; // Hide empty links in view mode

  return (
    <div className="info-field">
      <label>{label}</label>
      <a href={value} target="_blank" rel="noopener noreferrer" className="field-value social-link">
        {value}
      </a>
    </div>
  );
}

function FacultyProfile() {
  const dispatch = useDispatch();

  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Per-section edit mode — each card has its own toggle
  const [editingSections, setEditingSections] = useState({});
  function toggleSection(section) {
    setEditingSections((prev) => ({ ...prev, [section]: !prev[section] }));
    setShowPasswordForm(false);
    setError("");
  }
  function enableSection(section) {
    setEditingSections((prev) => ({ ...prev, [section]: true }));
    setShowPasswordForm(false);
    setError("");
  }

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Projects state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null); // null = adding NEW, number = editing EXISTING
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    technologies: "",
    gitLink: "",     // Link to GitHub/Git repository (source code)
    hostLink: "",    // Link to live/hosted version of the project
    startDate: "",
    endDate: "",
  });

  // Experience state
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    position: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  // Certificates state
  const [showCertForm, setShowCertForm] = useState(false);
  const [editingCertIndex, setEditingCertIndex] = useState(null);
  const [certForm, setCertForm] = useState({
    title: "",
    organization: "",
    startDate: "",
    link: "",
    description: "",
  });

  // Education state
  const [showEduForm, setShowEduForm] = useState(false);
  const [editingEduIndex, setEditingEduIndex] = useState(null);
  const [eduForm, setEduForm] = useState({
    level: "",
    institute: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    gradeType: "",
    grade: "",
    maxGrade: "",
  });

  // Skills search state
  const [skillSearch, setSkillSearch] = useState("");

  // File upload ref
  const fileInputRef = useRef(null);

  // ============================================================
  // LOAD PROFILE
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
  // INPUT HANDLERS
  // ============================================================
  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }

  // Handles changes for socialLinks fields (nested object)
  function handleSocialLinkChange(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [name]: value,
      },
    }));
  }

  // ============================================================
  // SAVE PROFILE
  // ============================================================
  async function handleSave(onSuccessCallback) {
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
        projects: profile.projects,
        experience: profile.experience,
        coCurricular: profile.coCurricular,
        positionOfResponsibility: profile.positionOfResponsibility,
        coCurricularAndPor: profile.coCurricularAndPor,
        achievements: profile.achievements,
        certificates: profile.certificates,
        education: profile.education,
        skills: profile.skills,
        bio: profile.bio,
        socialLinks: profile.socialLinks,
      };

      const result = await profileApi.updateProfile(facultyData);
      if (result.user) {
        setProfile(result.user);
        dispatch(updateUser(result.user));
      }
      setSuccess(result.msg || "Profile updated!");

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Called when saving a single card/section
  function handleSectionSave(section) {
    handleSave(() => {
      setEditingSections((prev) => ({ ...prev, [section]: false }));
    });
  }

  // Called when cancelling a single card/section — reloads original data
  function handleSectionCancel(section) {
    setEditingSections((prev) => ({ ...prev, [section]: false }));
    fetchProfile();
    setError("");
  }

  // ============================================================
  // PROJECT FUNCTIONS — Add, Edit, and Remove Projects
  // ============================================================

  // Open the form to add a NEW project
  function handleAddProject() {
    setProjectForm({
      title: "",
      description: "",
      technologies: "",
      gitLink: "",
      hostLink: "",
      startDate: "",
      endDate: "",
    });
    setEditingProjectIndex(null);
    setShowProjectForm(true);
    enableSection("projects");
  }

  // Open the form to EDIT an existing project
  function handleEditProject(index) {
    const project = profile.projects[index];
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      technologies: project.technologies || "",
      gitLink: project.gitLink || "",
      hostLink: project.hostLink || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    });
    setEditingProjectIndex(index);
    setShowProjectForm(true);
  }

  // Remove a project from the list
  function handleRemoveProject(index) {
    if (!window.confirm("Remove this project? This cannot be undone.")) return;
    const updatedProjects = profile.projects.filter((_, i) => i !== index);
    setProfile((prev) => ({ ...prev, projects: updatedProjects }));
  }

  // Update the form fields when user types
  function handleProjectFormChange(e) {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  }

  // Save the project (add new OR update existing)
  function handleSaveProject() {
    if (!projectForm.title.trim()) {
      setError("Project title is required!");
      return;
    }

    let updatedProjects;
    if (editingProjectIndex === null) {
      updatedProjects = [...(profile.projects || []), { ...projectForm }];
    } else {
      updatedProjects = [...(profile.projects || [])];
      updatedProjects[editingProjectIndex] = { ...projectForm };
    }

    setProfile((prev) => ({ ...prev, projects: updatedProjects }));
    setShowProjectForm(false);
    setEditingProjectIndex(null);
    setError("");
  }

  // Cancel the project form
  function handleCancelProjectForm() {
    setShowProjectForm(false);
    setEditingProjectIndex(null);
    setError("");
  }

  // ============================================================
  // EXPERIENCE FUNCTIONS — Add, Edit, and Remove Experience
  // ============================================================

  function handleAddExperience() {
    setExperienceForm({ company: "", position: "", description: "", location: "", startDate: "", endDate: "" });
    setEditingExperienceIndex(null);
    setShowExperienceForm(true);
    enableSection("experience");
  }

  function handleEditExperience(index) {
    const exp = profile.experience[index];
    setExperienceForm({
      company: exp.company || "",
      position: exp.position || "",
      description: exp.description || "",
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
    });
    setEditingExperienceIndex(index);
    setShowExperienceForm(true);
  }

  function handleRemoveExperience(index) {
    if (!window.confirm("Remove this experience? This cannot be undone.")) return;
    const updated = profile.experience.filter((_, i) => i !== index);
    setProfile((prev) => ({ ...prev, experience: updated }));
  }

  function handleExperienceFormChange(e) {
    const { name, value } = e.target;
    setExperienceForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSaveExperience() {
    if (!experienceForm.company.trim()) {
      setError("Company name is required!");
      return;
    }
    let updated;
    if (editingExperienceIndex === null) {
      updated = [...(profile.experience || []), { ...experienceForm }];
    } else {
      updated = [...(profile.experience || [])];
      updated[editingExperienceIndex] = { ...experienceForm };
    }
    setProfile((prev) => ({ ...prev, experience: updated }));
    setShowExperienceForm(false);
    setEditingExperienceIndex(null);
    setError("");
  }

  function handleCancelExperienceForm() {
    setShowExperienceForm(false);
    setEditingExperienceIndex(null);
    setError("");
  }

  // ============================================================
  // CERTIFICATE FUNCTIONS — Add, Edit, and Remove Certificates
  // ============================================================

  function handleAddCert() {
    setCertForm({ title: "", organization: "", startDate: "", link: "", description: "" });
    setEditingCertIndex(null);
    setShowCertForm(true);
    enableSection("certificates");
  }

  function handleEditCert(index) {
    const cert = profile.certificates[index];
    setCertForm({
      title: cert.title || "",
      organization: cert.organization || "",
      startDate: cert.startDate || "",
      link: cert.link || "",
      description: cert.description || "",
    });
    setEditingCertIndex(index);
    setShowCertForm(true);
  }

  function handleRemoveCert(index) {
    if (!window.confirm("Remove this certificate? This cannot be undone.")) return;
    const updated = profile.certificates.filter((_, i) => i !== index);
    setProfile((prev) => ({ ...prev, certificates: updated }));
  }

  function handleCertFormChange(e) {
    const { name, value } = e.target;
    setCertForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSaveCert() {
    if (!certForm.title.trim()) {
      setError("Certificate title is required!");
      return;
    }
    let updated;
    if (editingCertIndex === null) {
      updated = [...(profile.certificates || []), { ...certForm }];
    } else {
      updated = [...(profile.certificates || [])];
      updated[editingCertIndex] = { ...certForm };
    }
    setProfile((prev) => ({ ...prev, certificates: updated }));
    setShowCertForm(false);
    setEditingCertIndex(null);
    setError("");
  }

  function handleCancelCertForm() {
    setShowCertForm(false);
    setEditingCertIndex(null);
    setError("");
  }

  // ============================================================
  // EDUCATION FUNCTIONS — Add, Edit, and Remove Education
  // ============================================================

  function handleAddEdu() {
    setEduForm({
      level: "", institute: "", degree: "", fieldOfStudy: "",
      startDate: "", endDate: "", gradeType: "", grade: "", maxGrade: "",
    });
    setEditingEduIndex(null);
    setShowEduForm(true);
    enableSection("education");
  }

  function handleEditEdu(index) {
    const edu = profile.education[index];
    setEduForm({
      level: edu.level || "",
      institute: edu.institute || "",
      degree: edu.degree || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      gradeType: edu.gradeType || "",
      grade: edu.grade || "",
      maxGrade: edu.maxGrade || "",
    });
    setEditingEduIndex(index);
    setShowEduForm(true);
  }

  function handleRemoveEdu(index) {
    if (!window.confirm("Remove this education entry? This cannot be undone.")) return;
    const updated = profile.education.filter((_, i) => i !== index);
    setProfile((prev) => ({ ...prev, education: updated }));
  }

  function handleEduFormChange(e) {
    const { name, value } = e.target;
    setEduForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSaveEdu() {
    if (!eduForm.level.trim()) {
      setError("Please select an education level!");
      return;
    }
    if (!eduForm.institute.trim()) {
      setError("Institute name is required!");
      return;
    }
    let updated;
    if (editingEduIndex === null) {
      updated = [...(profile.education || []), { ...eduForm }];
    } else {
      updated = [...(profile.education || [])];
      updated[editingEduIndex] = { ...eduForm };
    }
    setProfile((prev) => ({ ...prev, education: updated }));
    setShowEduForm(false);
    setEditingEduIndex(null);
    setError("");
  }

  function handleCancelEduForm() {
    setShowEduForm(false);
    setEditingEduIndex(null);
    setError("");
  }

  // ============================================================
  // CANCEL
  // ============================================================
  function handleCancel() {
    setEditingSections({});
    fetchProfile();
    setError("");
  }

  // ============================================================
  // UPLOAD IMAGE
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
      setSuccess("Profile picture updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to upload image: " + err.message);
    }
  }

  // ============================================================
  // CHANGE PASSWORD
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
      setSuccess("Password changed successfully!");
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed: " + err.message);
    }
  }

  // ============================================================
  // LOADING
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
  // FULL PROFILE PAGE
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
      {/* LEFT SIDE — Photo Card                          */}
      {/* ================================================== */}
      <div className="profile-layout">
        <div className="profile-side-card">
          {/* Photo */}
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
                Upload
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
              {profile.role === "teacher" ? "Faculty" : "Staff"}
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
                const allClosed = Object.keys(editingSections).length === 0;
                if (allClosed) {
                  const sections = ["personalInfo","bio","socialLinks","skills","education","professionalInfo","address","experience","coCurricular","achievements","certificates","projects"];
                  const allOpen = {};
                  sections.forEach(s => allOpen[s] = true);
                  setEditingSections(allOpen);
                } else {
                  setEditingSections({});
                }
                setShowPasswordForm(false);
              }}
            >
              {Object.keys(editingSections).length > 0 ? "Cancel All" : "Edit All"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setEditingSections({});
              }}
            >
              {showPasswordForm ? "Close" : "Change Password"}
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* RIGHT SIDE — Info Cards                         */}
        {/* ================================================== */}
        <div className="profile-main-cards">
          {/* Password Change */}
          {showPasswordForm && (
            <div className="profile-card password-card">
              <div className="card-header">
                <h3>Change Password</h3>
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
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* Personal Info */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              {editingSections.personalInfo ? (
                <span className="editing-badge">Editing</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("personalInfo"); setShowPasswordForm(false); }}>Edit</button>
              )}
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-field">
                  <label>Full Name</label>
                  {editingSections.personalInfo ? (
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
                  {editingSections.personalInfo ? (
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
                  {editingSections.personalInfo ? (
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
                  {editingSections.personalInfo ? (
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
                  {editingSections.personalInfo ? (
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
              {editingSections.personalInfo && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("personalInfo")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("personalInfo")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bio / About Me */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Bio</h3>
              {editingSections.bio ? (
                <span className="editing-badge">Editing</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("bio"); setShowPasswordForm(false); }}>Edit</button>
              )}
            </div>
            <div className="card-body">
              <div className="info-field full-width">
                <label>About Me</label>
                {editingSections.bio ? (
                  <textarea
                    name="bio"
                    value={profile.bio || ""}
                    onChange={handleChange}
                    placeholder="Write a short bio — your teaching philosophy, research interests, or anything you'd like to share..."
                    rows={4}
                  />
                ) : (
                  <p className="field-value">
                    {profile.bio || "No bio added yet."}
                  </p>
                )}
              </div>
              {editingSections.bio && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("bio")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("bio")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Links — Coding profiles & portfolio */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Social Links</h3>
              {editingSections.socialLinks ? (
                <span className="editing-badge">Editing</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("socialLinks"); setShowPasswordForm(false); }}>Edit</button>
              )}
            </div>
            <div className="card-body">
              <div className="info-grid social-links-grid">
                <SocialLinkInput label="LinkedIn" name="linkedin" value={profile.socialLinks?.linkedin || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://linkedin.com/in/your-profile" />
                <SocialLinkInput label="GitHub" name="github" value={profile.socialLinks?.github || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://github.com/your-username" />
                <SocialLinkInput label="HackerEarth" name="hackerearth" value={profile.socialLinks?.hackerearth || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://hackerearth.com/@your-profile" />
                <SocialLinkInput label="HackerRank" name="hackerrank" value={profile.socialLinks?.hackerrank || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://hackerrank.com/your-profile" />
                <SocialLinkInput label="CodeChef" name="codechef" value={profile.socialLinks?.codechef || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://codechef.com/users/your-username" />
                <SocialLinkInput label="LeetCode" name="leetcode" value={profile.socialLinks?.leetcode || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://leetcode.com/your-username" />
                <SocialLinkInput label="CodeForces" name="codeforces" value={profile.socialLinks?.codeforces || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://codeforces.com/profile/your-username" />
                <SocialLinkInput label="Kaggle" name="kaggle" value={profile.socialLinks?.kaggle || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://kaggle.com/your-username" />
                <SocialLinkInput label="Portfolio" name="portfolio" value={profile.socialLinks?.portfolio || ""} isEditing={editingSections.socialLinks} onChange={handleSocialLinkChange} placeholder="https://your-portfolio.com" />
              </div>
              {editingSections.socialLinks && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("socialLinks")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("socialLinks")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Skills — Searchable predefined skills list */}
          <div className="profile-card skills-card">
            <div className="card-header">
              <h3>Skills</h3>
              {editingSections.skills ? (
                <span className="editing-badge">Editing</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("skills"); setShowPasswordForm(false); }}>Edit</button>
              )}
            </div>
            <div className="card-body">
              {/* Edit mode: search + checkboxes for ALL skills */}
              {editingSections.skills && (
                <div className="skills-editor">
                  <input
                    type="text"
                    className="skill-search-input"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                  />
                  <div className="skills-checkbox-grid">
                    {SKILLS_LIST.filter((s) =>
                      s.toLowerCase().includes(skillSearch.toLowerCase())
                    ).map((skill) => {
                      const isSelected = profile.skills?.includes(skill);
                      return (
                        <label
                          key={skill}
                          className={`skill-checkbox-item ${isSelected ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setProfile((prev) => ({
                                  ...prev,
                                  skills: (prev.skills || []).filter((s) => s !== skill),
                                }));
                              } else {
                                setProfile((prev) => ({
                                  ...prev,
                                  skills: [...(prev.skills || []), skill],
                                }));
                              }
                            }}
                          />
                          <span className="skill-checkbox-label">{skill}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected skills count and tags in view mode */}
              {!editingSections.skills && profile.skills && profile.skills.length > 0 && (
                <div className="skills-tags">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
              {!editingSections.skills && (!profile.skills || profile.skills.length === 0) && (
                <div className="empty-skills">
                  <p>No skills added yet.</p>
                </div>
              )}
              {editingSections.skills && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("skills")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("skills")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Education — Academic qualifications */}
          <div className="profile-card edu-card">
            <div className="card-header">
              <h3>Education</h3>
              <div className="card-header-actions">
                <button className="btn btn-sm btn-outline" onClick={handleAddEdu}>
                  Add Education
                </button>
                {!editingSections.education && (
                  <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("education"); setShowPasswordForm(false); }}>
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              {/* Education Form */}
              {showEduForm && (
                <div className="edu-form">
                  <h4 className="edu-form-title">
                    {editingEduIndex === null ? "New Education" : "Edit Education"}
                  </h4>
                  <div className="info-grid">
                    <div className="info-field full-width">
                      <label>Level of Education *</label>
                      <select
                        name="level"
                        value={eduForm.level}
                        onChange={handleEduFormChange}
                      >
                        <option value="">Select level of education</option>
                        <option value="10th or Equivalent">10th or Equivalent</option>
                        <option value="12th or Equivalent">12th or Equivalent</option>
                        <option value="Graduation">Graduation</option>
                        <option value="Post Graduation">Post Graduation</option>
                      </select>
                    </div>
                    <div className="info-field full-width">
                      <label>Institute *</label>
                      <input
                        type="text"
                        name="institute"
                        value={eduForm.institute}
                        onChange={handleEduFormChange}
                        placeholder="Enter your institute name"
                      />
                    </div>
                    <div className="info-field">
                      <label>Degree</label>
                      <input
                        type="text"
                        name="degree"
                        value={eduForm.degree}
                        onChange={handleEduFormChange}
                        placeholder="e.g. B.Tech, B.Sc, M.Tech"
                      />
                    </div>
                    <div className="info-field">
                      <label>Field of Study</label>
                      <select
                        name="fieldOfStudy"
                        value={eduForm.fieldOfStudy}
                        onChange={handleEduFormChange}
                      >
                        <option value="">Select field of study</option>
                        {FIELD_OF_STUDY_LIST.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className="info-field">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={eduForm.startDate}
                        onChange={handleEduFormChange}
                      />
                    </div>
                    <div className="info-field">
                      <label>End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={eduForm.endDate}
                        onChange={handleEduFormChange}
                      />
                    </div>
                    <div className="info-field">
                      <label>Grade Type</label>
                      <select
                        name="gradeType"
                        value={eduForm.gradeType}
                        onChange={handleEduFormChange}
                      >
                        <option value="">Select grade type</option>
                        <option value="CGPA">CGPA</option>
                        <option value="Percentage">Percentage</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    <div className="info-field">
                      <label>Grade</label>
                      <input
                        type="text"
                        name="grade"
                        value={eduForm.grade}
                        onChange={handleEduFormChange}
                        placeholder="Percentage or CGPA"
                      />
                    </div>
                    <div className="info-field">
                      <label>Max Grade</label>
                      <input
                        type="text"
                        name="maxGrade"
                        value={eduForm.maxGrade}
                        onChange={handleEduFormChange}
                        placeholder="e.g. 10.0, 100%"
                      />
                    </div>
                  </div>
                  <div className="edu-form-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleSaveEdu}>
                      Save Education
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={handleCancelEduForm}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* List of Education */}
              {(!profile.education || profile.education.length === 0) && !showEduForm ? (
                <div className="empty-edu">
                  <p>
                    {editingSections.education
                      ? "No education entries yet. Click 'Add Education' to add your qualifications!"
                      : "No education added yet."}
                  </p>
                </div>
              ) : (
                <div className="edu-list">
                  {profile.education.map((edu, index) => (
                    <div className="edu-item" key={index}>
                      <div className="edu-item-header">
                        <div className="edu-item-title-group">
                          <h4 className="edu-level">{edu.level || "Untitled"}</h4>
                          {edu.institute && <span className="edu-institute">{edu.institute}</span>}
                        </div>
                        {editingSections.education && (
                          <div className="edu-item-actions">
                            <button className="btn btn-sm btn-outline" onClick={() => handleEditEdu(index)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger-outline" onClick={() => handleRemoveEdu(index)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="edu-details">
                        {edu.degree && <span className="edu-degree">{edu.degree}</span>}
                        {edu.degree && edu.fieldOfStudy && <span className="edu-dot">·</span>}
                        {edu.fieldOfStudy && <span className="edu-field">{edu.fieldOfStudy}</span>}
                      </div>
                      <div className="edu-meta">
                        {(edu.startDate || edu.endDate) && (
                          <span className="edu-date">
                            {edu.startDate
                              ? new Date(edu.startDate).toLocaleDateString("en-US", {
                                  year: "numeric", month: "short",
                                })
                              : ""}
                            {edu.startDate && edu.endDate ? " — " : ""}
                            {edu.endDate
                              ? new Date(edu.endDate).toLocaleDateString("en-US", {
                                  year: "numeric", month: "short",
                                })
                              : edu.startDate ? " -- Present" : ""}
                          </span>
                        )}
                        {(edu.grade || edu.maxGrade) && (
                          <span className="edu-grade">
                            {edu.gradeType ? `${edu.gradeType}: ` : ""}
                            {edu.grade || ""}
                            {edu.maxGrade ? ` / ${edu.maxGrade}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {editingSections.education && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("education")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("education")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Professional Info */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Professional Information</h3>
              {editingSections.professionalInfo ? (
                <span className="editing-badge">Editing</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("professionalInfo"); setShowPasswordForm(false); }}>Edit</button>
              )}
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-field">
                  <label>Department</label>
                  {editingSections.professionalInfo ? (
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
                  {editingSections.professionalInfo ? (
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
                  {editingSections.professionalInfo ? (
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
              {editingSections.professionalInfo && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("professionalInfo")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("professionalInfo")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Address</h3>
              {editingSections.address ? (
                <span className="editing-badge">Editing</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("address"); setShowPasswordForm(false); }}>Edit</button>
              )}
            </div>
            <div className="card-body">
              <div className="info-grid two-col">
                <div className="info-field">
                  <label>Current Address</label>
                  {editingSections.address ? (
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
                  {editingSections.address ? (
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
              {editingSections.address && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("address")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("address")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* EXPERIENCE — Work experience entries */}
          <div className="profile-card experience-card">
            <div className="card-header">
              <h3>Experience</h3>
              <div className="card-header-actions">
                <button className="btn btn-sm btn-outline" onClick={handleAddExperience}>
                  Add Experience
                </button>
                {!editingSections.experience && (
                  <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("experience"); setShowPasswordForm(false); }}>
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              {/* Experience Form */}
              {showExperienceForm && (
                <div className="experience-form">
                  <h4 className="experience-form-title">
                    {editingExperienceIndex === null ? "New Experience" : "Edit Experience"}
                  </h4>
                  <div className="info-grid">
                    <div className="info-field full-width">
                      <label>Company *</label>
                      <input
                        type="text"
                        name="company"
                        value={experienceForm.company}
                        onChange={handleExperienceFormChange}
                        placeholder="e.g. Google, Microsoft"
                      />
                    </div>
                    <div className="info-field full-width">
                      <label>Position / Role</label>
                      <input
                        type="text"
                        name="position"
                        value={experienceForm.position}
                        onChange={handleExperienceFormChange}
                        placeholder="e.g. Software Engineer Intern"
                      />
                    </div>
                    <div className="info-field full-width">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={experienceForm.description}
                        onChange={handleExperienceFormChange}
                        placeholder="What did you do? Key responsibilities and achievements..."
                        rows={3}
                      />
                    </div>
                    <div className="info-field">
                      <label>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={experienceForm.location}
                        onChange={handleExperienceFormChange}
                        placeholder="e.g. Bangalore, India"
                      />
                    </div>
                    <div className="info-field">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={experienceForm.startDate}
                        onChange={handleExperienceFormChange}
                      />
                    </div>
                    <div className="info-field">
                      <label>End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={experienceForm.endDate}
                        onChange={handleExperienceFormChange}
                      />
                    </div>
                  </div>
                  <div className="experience-form-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleSaveExperience}>
                      Save Experience
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={handleCancelExperienceForm}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* List of Experience */}
              {(!profile.experience || profile.experience.length === 0) && !showExperienceForm ? (
                <div className="empty-experience">
                  <p>
                    {editingSections.experience
                      ? "No experience added yet. Click 'Add Experience' to share your work history!"
                      : "No experience added yet."}
                  </p>
                </div>
              ) : (
                <div className="experience-list">
                  {profile.experience.map((exp, index) => (
                    <div className="experience-item" key={index}>
                      <div className="experience-item-header">
                        <div className="experience-item-title-group">
                          <h4 className="experience-company">{exp.company || "Untitled"}</h4>
                          {exp.position && <span className="experience-position">{exp.position}</span>}
                        </div>
                        {editingSections.experience && (
                          <div className="experience-item-actions">
                            <button className="btn btn-sm btn-outline" onClick={() => handleEditExperience(index)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger-outline" onClick={() => handleRemoveExperience(index)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {exp.description && (
                        <p className="experience-description">{exp.description}</p>
                      )}
                      <div className="experience-meta">
                        {exp.location && <span className="experience-location">{exp.location}</span>}
                        {exp.startDate && (
                          <span className="experience-date">
                            {new Date(exp.startDate).toLocaleDateString("en-US", {
                              year: "numeric", month: "short",
                            })}
                            {exp.endDate
                              ? ` — ${new Date(exp.endDate).toLocaleDateString("en-US", {
                                  year: "numeric", month: "short",
                                })}`
                              : " -- Present"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {editingSections.experience && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("experience")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("experience")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Co-curricular & POR — Free-text like Bio */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Co-curricular &amp; POR</h3>
              {editingSections.coCurricular ? (
                <span className="editing-badge">Editing</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("coCurricular"); setShowPasswordForm(false); }}>Edit</button>
              )}
            </div>
            <div className="card-body">
              <div className="info-field full-width">
                <label>Activities &amp; Positions of Responsibility</label>
                {editingSections.coCurricular ? (
                  <textarea
                    name="coCurricularAndPor"
                    value={profile.coCurricularAndPor || ""}
                    onChange={handleChange}
                    placeholder="Describe your co-curricular activities, positions of responsibility, clubs, committees, and any leadership roles you've held..."
                    rows={4}
                  />
                ) : (
                  <p className="field-value">
                    {profile.coCurricularAndPor || "No co-curricular activities or positions added yet."}
                  </p>
                )}
              </div>
              {editingSections.coCurricular && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("coCurricular")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("coCurricular")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Achievements</h3>
              {editingSections.achievements ? (
                <span className="editing-badge">Editing</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("achievements"); setShowPasswordForm(false); }}>Edit</button>
              )}
            </div>
            <div className="card-body">
              <div className="info-field full-width">
                <label>Awards &amp; Achievements</label>
                {editingSections.achievements ? (
                  <textarea
                    name="achievements"
                    value={profile.achievements || ""}
                    onChange={handleChange}
                    placeholder="List your achievements — awards, honors, scholarships, competition wins, recognitions..."
                    rows={4}
                  />
                ) : (
                  <p className="field-value">
                    {profile.achievements || "No achievements added yet."}
                  </p>
                )}
              </div>
              {editingSections.achievements && (
                <div className="section-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSectionSave("achievements")} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSectionCancel("achievements")} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Certificates */}
          <div className="profile-card cert-card">
            <div className="card-header">
              <h3>Certificates</h3>
              <div className="card-header-actions">
                <button className="btn btn-sm btn-outline" onClick={handleAddCert}>
                  Add Certificate
                </button>
                {!editingSections.certificates && (
                  <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("certificates"); setShowPasswordForm(false); }}>
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              {/* Certificate Form */}
              {showCertForm && (
                <div className="cert-form">
                  <h4 className="cert-form-title">
                    {editingCertIndex === null ? "New Certificate" : "Edit Certificate"}
                  </h4>
                  <div className="info-grid">
                    <div className="info-field full-width">
                      <label>Certificate Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={certForm.title}
                        onChange={handleCertFormChange}
                        placeholder="Enter certificate title"
                      />
                    </div>
                    <div className="info-field full-width">
                      <label>Provider Organisation Name</label>
                      <input
                        type="text"
                        name="organization"
                        value={certForm.organization}
                        onChange={handleCertFormChange}
                        placeholder="Enter Organisation Name"
                      />
                    </div>
                    <div className="info-field">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={certForm.startDate}
                        onChange={handleCertFormChange}
                      />
                    </div>
                    <div className="info-field">
                      <label>Certification Link</label>
                      <input
                        type="url"
                        name="link"
                        value={certForm.link}
                        onChange={handleCertFormChange}
                        placeholder="Enter Certification Link"
                      />
                    </div>
                    <div className="info-field full-width">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={certForm.description}
                        onChange={handleCertFormChange}
                        placeholder="Briefly describe what the certificate covers..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="cert-form-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleSaveCert}>
                      Save Certificate
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={handleCancelCertForm}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* List of Certificates */}
              {(!profile.certificates || profile.certificates.length === 0) && !showCertForm ? (
                <div className="empty-cert">
                  <p>
                    {editingSections.certificates
                      ? "No certificates yet. Click 'Add Certificate' to showcase your credentials!"
                      : "No certificates added yet."}
                  </p>
                </div>
              ) : (
                <div className="cert-list">
                  {profile.certificates.map((cert, index) => (
                    <div className="cert-item" key={index}>
                      <div className="cert-item-header">
                        <div className="cert-item-title-group">
                          <h4 className="cert-title">{cert.title || "Untitled"}</h4>
                          {cert.organization && <span className="cert-organization">{cert.organization}</span>}
                        </div>
                        {editingSections.certificates && (
                          <div className="cert-item-actions">
                            <button className="btn btn-sm btn-outline" onClick={() => handleEditCert(index)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger-outline" onClick={() => handleRemoveCert(index)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {cert.description && (
                        <p className="cert-description">{cert.description}</p>
                      )}
                      <div className="cert-meta">
                        {cert.startDate && (
                          <span className="cert-date">
                            {new Date(cert.startDate).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </span>
                        )}
                        {cert.link && (
                          <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cert-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PROJECTS — Works for BOTH Students & Faculty! */}
          <div className="profile-card projects-card">
            <div className="card-header">
              <h3>Projects</h3>
              <div className="card-header-actions">
                <button className="btn btn-sm btn-outline" onClick={handleAddProject}>
                  Add Project
                </button>
                {!editingSections.projects && (
                  <button className="btn btn-sm btn-ghost" onClick={() => { toggleSection("projects"); setShowPasswordForm(false); }}>
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              {/* Project Form (appears when adding/editing) */}
              {showProjectForm && (
                <div className="project-form">
                  <h4 className="project-form-title">
                    {editingProjectIndex === null ? "New Project" : "Edit Project"}
                  </h4>
                  <div className="info-grid">
                    <div className="info-field full-width">
                      <label>Project Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={projectForm.title}
                        onChange={handleProjectFormChange}
                        placeholder="e.g. Library Management System"
                      />
                    </div>
                    <div className="info-field full-width">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={projectForm.description}
                        onChange={handleProjectFormChange}
                        placeholder="What does your project do?"
                        rows={3}
                      />
                    </div>
                    <div className="info-field">
                      <label>Technologies</label>
                      <input
                        type="text"
                        name="technologies"
                        value={projectForm.technologies}
                        onChange={handleProjectFormChange}
                        placeholder="e.g. React, Node.js, MongoDB"
                      />
                    </div>
                    <div className="info-field">
                      <label>Git Code Link</label>
                      <input
                        type="url"
                        name="gitLink"
                        value={projectForm.gitLink}
                        onChange={handleProjectFormChange}
                        placeholder="https://github.com/your/project"
                      />
                    </div>
                    <div className="info-field full-width">
                      <label>Host Link</label>
                      <input
                        type="url"
                        name="hostLink"
                        value={projectForm.hostLink}
                        onChange={handleProjectFormChange}
                        placeholder="https://your-project.vercel.app"
                      />
                    </div>
                    <div className="info-field">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={projectForm.startDate}
                        onChange={handleProjectFormChange}
                      />
                    </div>
                    <div className="info-field">
                      <label>End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={projectForm.endDate}
                        onChange={handleProjectFormChange}
                      />
                    </div>
                  </div>
                  <div className="project-form-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProject}>
                      Save Project
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={handleCancelProjectForm}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* List of Projects */}
              {(!profile.projects || profile.projects.length === 0) && !showProjectForm ? (
                <div className="empty-projects">
                  <p>
                    {editingSections.projects
                      ? "No projects yet. Click 'Add Project' to showcase your work!"
                      : "No projects added yet."}
                  </p>
                </div>
              ) : (
                <div className="projects-list">
                  {profile.projects.map((project, index) => (
                    <div className="project-item" key={index}>
                      <div className="project-item-header">
                        <h4 className="project-title">{project.title || "Untitled"}</h4>
                        {editingSections.projects && (
                          <div className="project-item-actions">
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEditProject(index)}
                              title="Edit project"
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger-outline"
                              onClick={() => handleRemoveProject(index)}
                              title="Remove project"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {project.description && (
                        <p className="project-description">{project.description}</p>
                      )}
                      {project.technologies && (
                        <div className="project-tech-tags">
                          {project.technologies.split(",").map((tech, i) => (
                            <span className="tech-tag" key={i}>{tech.trim()}</span>
                          ))}
                        </div>
                      )}
                      {/* Links row — Git code + Host link */}
                      <div className="project-meta">
                        {project.startDate && (
                          <span className="project-date">
                            {new Date(project.startDate).toLocaleDateString("en-US", {
                              year: "numeric", month: "short",
                            })}
                            {project.endDate
                              ? ` — ${new Date(project.endDate).toLocaleDateString("en-US", {
                                  year: "numeric", month: "short",
                                })}`
                              : " -- Present"}
                          </span>
                        )}
                        <div className="project-links">
                          {project.gitLink && (
                            <a href={project.gitLink} target="_blank" rel="noopener noreferrer" className="project-link" onClick={(e) => e.stopPropagation()}>
                              Git Code
                            </a>
                          )}
                          {project.hostLink && (
                            <a href={project.hostLink} target="_blank" rel="noopener noreferrer" className="project-link" onClick={(e) => e.stopPropagation()}>
                              Host Link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Account Information</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-field">
                  <label>Email</label>
                  <p className="field-value">{profile.email || "N/A"}</p>
                </div>
                <div className="info-field">
                  <label>Role</label>
                  <p className="field-value role-badge">Faculty</p>
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
          {Object.keys(editingSections).length > 0 && (
            <div className="profile-edit-actions">
              <button className="btn btn-primary btn-large" onClick={() => handleSave(() => setEditingSections({}))} disabled={saving}>
                {saving ? "Saving..." : "Save All Changes"}
              </button>
              <button className="btn btn-outline btn-large" onClick={handleCancel} disabled={saving}>
                Cancel All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacultyProfile;
