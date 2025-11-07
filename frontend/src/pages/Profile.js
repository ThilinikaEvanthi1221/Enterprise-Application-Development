import React, { useState, useEffect } from "react";

import {
  getProfile,
  updateProfile,
  getMyVehicles,
  getVehicleByNumber,
  uploadProfileImage,
} from "../services/api";
import { useNavigate, NavLink } from "react-router-dom";
import Layout from "../components/Layout";
import "./Dashboard.css";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const [vLoading, setVLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [vError, setVError] = useState("");
  const [searchPlate, setSearchPlate] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const API_ORIGIN =
    process.env.REACT_APP_API_ORIGIN || "http://localhost:5000";

  const buildImgSrc = (p) =>
    p ? (p.startsWith("http") ? p : `${API_ORIGIN}${p}`) : "";

  // Correct defaults: 260 desktop, 80 mobile
  const [sidebarPad, setSidebarPad] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768 ? 8 : 8
  );
  useEffect(() => {
    const onResize = () => setSidebarPad(window.innerWidth <= 768 ? 8 : 8);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(payload.role);
      setUser(userData);
    } catch (e) {
      console.error("Error decoding token:", e);
    }

    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (!loading) loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      const data = res.data;
      setProfile(data);
      setForm({
        name: data.name || "",
        address: data.address || "",
        phone: data.phone || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    setVLoading(true);
    setVError("");
    try {
      const res = await getMyVehicles();
      setVehicles(res.data?.vehicles || []);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setVError("Could not load your vehicles.");
    } finally {
      setVLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);
    if (!searchPlate.trim()) return;
    try {
      const res = await getVehicleByNumber(searchPlate.trim());
      setLookupResult(res.data);
    } catch (err) {
      if (err?.response?.status === 404)
        setLookupError("No vehicle found for that plate.");
      else if (err?.response?.status === 403)
        setLookupError("This plate is registered to another user.");
      else if (err?.response?.data?.msg) setLookupError(err.response.data.msg);
      else setLookupError("Lookup failed.");
    }
  };

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const onUploadAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const res = await uploadProfileImage(fd);
      setProfile(res.data);
      setAvatarOpen(false);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || "Upload failed");
    } finally {
      setUploading(false);
    }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");

  };

  if (loading) return <div className="loading">Loading...</div>;


  const CameraIcon = ({ size = 16 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );

  return (
    <div
      className="dashboard-container profile-page"
      style={{
        background: "#1a56db",
        minHeight: "100vh",
        paddingLeft: sidebarPad,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="main-content"
        style={{
          marginLeft: 0,
          minHeight: "100vh",
          padding: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div
          className="profile-layout"
          style={{ width: "100%", maxWidth: 1100 }}
        >
          {/* LEFT: Profile (restructured) */}
          <div className="profile-left">
            <div className="auth-card">
              <header style={{ marginBottom: "1.25rem" }}>
                <h1 className="auth-title" style={{ marginBottom: 4 }}>
                  Profile
                </h1>
                <p className="auth-subtitle">
                  Manage your personal information
                </p>
              </header>

              <div className="profile-content">
                {/* Header row with avatar + name/email */}
                <div
                  className="profile-header"
                  style={{ alignItems: "center", gap: "1.25rem" }}
                >
                  <div
                    className="profile-avatar"
                    style={{
                      position: "relative",
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      overflow: "hidden",
                      cursor: "pointer",
                      flexShrink: 0,
                      overflow: "visible",
                    }}
                    onClick={() => setAvatarOpen(true)}
                    title="Change profile picture"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setAvatarOpen(true)
                    }
                  >
                    {profile?.profileImage ? (
                      <img
                        src={buildImgSrc(profile.profileImage)}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 32,
                        }}
                      >
                        {profile?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div
                      aria-hidden="true"
                      className="avatar-hover-overlay"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity .2s",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        <CameraIcon />
                        Change
                      </div>
                    </div>

                    {/* Camera fab */}
                    <button
                      type="button"
                      aria-label="Change profile picture"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarOpen(true);
                      }}
                      style={{
                        position: "absolute",
                        right: -6,
                        bottom: -6,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "none",
                        background: "#1a56db",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                        cursor: "pointer",
                      }}
                    >
                      <CameraIcon size={18} />
                    </button>
                  </div>

                  <div
                    className="profile-email"
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      Signed in as
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {profile?.name}
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <form onSubmit={handleSubmit} className="profile-form">
                  {/* Account section */}
                  <div className="section">
                    <h3 className="section-title">Account</h3>
                    <div className="form-grid two">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          className="auth-input"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email (read-only)</label>
                        <input
                          type="email"
                          className="auth-input"
                          value={profile?.email || ""}
                          disabled
                          readOnly
                          style={{ background: "#f9fafb", color: "#6b7280" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact section */}
                  <div className="section">
                    <h3 className="section-title">Contact</h3>
                    <div className="form-grid two">
                      <div
                        className="form-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label>Address</label>
                        <textarea
                          className="auth-input"
                          value={form.address}
                          onChange={(e) =>
                            setForm({ ...form, address: e.target.value })
                          }
                          placeholder="Your address"
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          className="auth-input"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          placeholder="Your phone number"
                        />
                        <small style={{ color: "#6b7280" }}>
                          Example: 07XXXXXXXX
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="logout-btn"
                      onClick={() =>
                        setForm({
                          name: profile?.name || "",
                          address: profile?.address || "",
                          phone: profile?.phone || "",
                        })
                      }
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="auth-button"
                      disabled={saving}
                      style={{ minWidth: 140 }}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: Vehicles (unchanged) */}
          <aside className="profile-right">
            <div className="auth-card">
              <header style={{ marginBottom: "1rem" }}>
                <h2
                  className="auth-title"
                  style={{ fontSize: 22, marginBottom: 4 }}
                >
                  Your Vehicles
                </h2>
                <p className="auth-subtitle">Plates linked to your account</p>
              </header>

              <form onSubmit={handleLookup} className="vehicle-lookup">
                <input
                  className="auth-input"
                  placeholder="Search plate number (e.g., ABC-1234)"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                />
                <button
                  type="submit"
                  className="auth-button"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Lookup
                </button>
              </form>

              {lookupError && <div className="error-text">{lookupError}</div>}
              {lookupResult && !lookupError && (
                <div className="vehicle-card">
                  <div className="vehicle-plate">
                    {lookupResult.plateNumber}
                  </div>
                  <div className="vehicle-meta">
                    {lookupResult.make} {lookupResult.model} •{" "}
                    {lookupResult.year || "—"}
                  </div>
                  <div
                    className={`tag ${
                      lookupResult.status === "active"
                        ? "tag-green"
                        : "tag-gray"
                    }`}
                  >
                    {lookupResult.status}
                  </div>
                </div>
              )}

              <hr className="divider" />

              {vLoading ? (
                <div className="loading">Loading vehicles…</div>
              ) : vError ? (
                <div className="error-text">{vError}</div>
              ) : vehicles.length === 0 ? (
                <div className="muted">No vehicles yet.</div>
              ) : (
                <div className="vehicle-list">
                  {vehicles.map((v) => (
                    <div key={v._id} className="vehicle-card">
                      <div className="vehicle-plate">{v.plateNumber}</div>
                      <div className="vehicle-meta">
                        {v.make} {v.model} • {v.year || "—"}
                      </div>
                      <div
                        className={`tag ${
                          v.status === "active" ? "tag-green" : "tag-gray"
                        }`}
                      >
                        {v.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Avatar Modal */}
      {avatarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setAvatarOpen(false)}
        >
          <div
            className="auth-card"
            style={{ width: 420, maxWidth: "90%", cursor: "default" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="auth-title"
              style={{ fontSize: 20, marginBottom: 8 }}
            >
              Update Profile Picture
            </h3>
            <p className="auth-subtitle">Choose an image (max 2MB).</p>

            <div style={{ margin: "12px 0" }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : profile?.profileImage ? (
                <img
                  src={buildImgSrc(profile.profileImage)}
                  alt="Current avatar"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : null}
            </div>

            <input type="file" accept="image/*" onChange={onPickAvatar} />

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                className="auth-button"
                onClick={onUploadAvatar}
                disabled={!avatarFile || uploading}
              >
                {uploading ? "Uploading..." : "Save"}
              </button>
              <button
                className="logout-btn"
                type="button"
                onClick={() => {
                  setAvatarOpen(false);
                  setAvatarFile(null);
                  setAvatarPreview("");
                }}
              >
                Cancel
              </button>
            </div>

  // Profile form content (reusable for all user types)
  const renderProfileForm = () => (
    <div className="profile-content" style={{ padding: "24px" }}>
      <div className="profile-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        background: userRole === 'customer' ? 'rgba(255,255,255,0.15)' : '#f9fafb',
        borderRadius: '12px'
      }}>
        <div className="profile-avatar" style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: userRole === 'customer' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'white',
          border: userRole === 'customer' ? '3px solid white' : 'none'
        }}>
          <span>{profile?.name?.[0]?.toUpperCase() || "?"}</span>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ 
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
            color: userRole === 'customer' ? 'rgba(255,255,255,0.8)' : '#6b7280',
            textTransform: 'uppercase'
          }}>Email Address</label>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: userRole === 'customer' ? 'white' : '#1f2937'
          }}>
            {profile?.email}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: userRole === 'customer' ? '600' : '500', 
            marginBottom: '8px',
            color: userRole === 'customer' ? 'white' : '#374151'
          }}>
            Full Name
          </label>
          <input
            type="text"
            className="auth-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            style={userRole === 'customer' ? {
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white'
            } : {}}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: userRole === 'customer' ? '600' : '500', 
            marginBottom: '8px',
            color: userRole === 'customer' ? 'white' : '#374151'
          }}>
            Address
          </label>
          <textarea
            className="auth-input"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Your address"
            rows="3"
            style={userRole === 'customer' ? {
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white'
            } : {}}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: userRole === 'customer' ? '600' : '500', 
            marginBottom: '8px',
            color: userRole === 'customer' ? 'white' : '#374151'
          }}>
            Phone Number
          </label>
          <input
            type="tel"
            className="auth-input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Your phone number"
            style={userRole === 'customer' ? {
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white'
            } : {}}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={userRole === 'customer' ? { 
            width: '100%',
            padding: '12px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          } : {
            width: '100%',
            padding: '12px',
            opacity: saving ? 0.6 : 1
          }}
          className={userRole !== 'customer' ? 'auth-button' : ''}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );

  // Admin Profile - Uses admin Layout (Sidebar + Header)
  if (userRole === "admin") {
    return (
      <Layout>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {renderProfileForm()}
        </div>
      </Layout>
    );
  }

  // Employee Profile - Uses employee dashboard layout
  if (userRole === "employee") {
    return (
      <div className="dashboard-container">
        {/* Employee Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">MMM</div>
              <span className="logo-text">AutoServicePro</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/employee" end className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </NavLink>
            <NavLink to="/employee-services" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              My Service Tasks
            </NavLink>
            <NavLink to="/employee/bookings" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Bookings
            </NavLink>
            <NavLink to="/employee/customers" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Customers
            </NavLink>
            <NavLink to="/employee/inventory" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventory
            </NavLink>
            <NavLink to="/employee/staff" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Staff Management
            </NavLink>
            <NavLink to="/employee/reports" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Employee Header */}
          <header className="dashboard-header">
            <div className="header-left">
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Manage your personal information</p>
            </div>
            <div className="header-right">
              <div className="search-bar">
                <input type="text" placeholder="Q Search..." />
                <span className="shortcut">⌘ K</span>
              </div>
              <div className="header-icons">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="notification-icon">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              <div className="user-profile">
                <div className="avatar">{user?.name?.charAt(0) || "E"}</div>
                <div className="user-info">
                  <span className="user-name">{user?.name || "Employee"}</span>
                  <span className="user-role">Employee</span>
                </div>
              </div>
              <button onClick={handleLogout} className="logout-btn" style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Logout
              </button>
            </div>
          </header>

          {/* Profile Content */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {renderProfileForm()}
          </div>
        </main>
      </div>
    );
  }

  // Customer Profile - Standalone with custom purple gradient styling
  return (
    <div className="auth-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="auth-wrapper">
        <div className="auth-card" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{
            padding: '30px',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '30px'
          }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              My Profile
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
              Manage your personal information
            </p>
          </div>

          <div style={{ padding: '0 30px 30px' }}>
            {renderProfileForm()}
          </div>
        </div>
      )}
    </div>
  );
}
