import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/api";
import "./Dashboard.css";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <header style={{ marginBottom: "2rem", textAlign: "center" }}>
            <h1 className="auth-title">My Profile</h1>
            <p className="auth-subtitle">Manage your personal information</p>
          </header>

          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-avatar">
                <span>{profile?.name?.[0]?.toUpperCase() || "?"}</span>
              </div>
              <div className="profile-email">
                <label>Email Address</label>
                <span>{profile?.email}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="auth-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
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
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Your phone number"
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={saving}
                style={{ width: "100%", marginTop: "1.5rem" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
