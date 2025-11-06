import React, { useState, useEffect } from "react";
import {
  getProfile,
  updateProfile,
  getMyVehicles,
  getVehicleByNumber,
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

  // dynamic left padding to match fixed sidebar width (260 -> 80 on small screens)
  const [sidebarPad, setSidebarPad] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768 ? 8 : 8
  );

  useEffect(() => {
    function onResize() {
      setSidebarPad(window.innerWidth <= 768 ? 80 : 260);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

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
      if (err?.response?.status === 404) {
        setLookupError("No vehicle found for that plate.");
      } else if (err?.response?.status === 403) {
        setLookupError("This plate is registered to another user.");
      } else if (err?.response?.data?.msg) {
        setLookupError(err.response.data.msg);
      } else {
        setLookupError("Lookup failed.");
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div
      className="dashboard-container profile-page"
      style={{
        background: "#1a56db",
        minHeight: "100vh",
        paddingLeft: sidebarPad, // ← space for fixed sidebar
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="main-content"
        style={{
          // hard override the global dashboard margin
          marginLeft: 0, // ← remove the left gap
          minHeight: "100vh",
          padding: 32,
          display: "flex",
          alignItems: "center", // vertical center
          justifyContent: "center", // horizontal center
          flex: 1,
        }}
      >
        <div
          className="profile-layout"
          style={{
            width: "100%",
            maxWidth: 1100, // nice readable width
          }}
        >
          <div className="profile-left">
            <div className="auth-card">
              <header style={{ marginBottom: "2rem", textAlign: "center" }}>
                <h1 className="auth-title">Profile</h1>
                <p className="auth-subtitle">
                  Manage your personal information
                </p>
              </header>

              <div className="profile-content">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <span>{profile?.name?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                  <div className="profile-email">
                    <label>Email</label>
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
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
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
    </div>
  );
}
