import React, { useState, useEffect } from "react";
import {
  getProfile,
  updateProfile,
  getMyVehicles,
  getVehicleByNumber,
  uploadProfileImage,
} from "../services/api";
import "./Dashboard.css";

export default function Profile() {
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

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!loading) loadVehicles();
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
                      cursor: "pointer",
                      overflow: "visible",
                      flexShrink: 0,
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
                    <div style={{ fontSize: 14, color: "#374151" }}>
                      {profile?.email}
                    </div>
                    <div style={{ marginTop: 8 }}></div>
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
          </div>
        </div>
      )}
    </div>
  );
}
