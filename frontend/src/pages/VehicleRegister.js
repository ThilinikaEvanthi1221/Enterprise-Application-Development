import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVehicleByNumber, createVehicle } from "../services/api";
import "./Dashboard.css";

export default function VehicleRegister() {
  const [plateNumber, setPlateNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(null); // null = not searched, false = not found, object = found
  const [form, setForm] = useState({ make: "", model: "", year: "" });
  const navigate = useNavigate();

  const checkVehicle = async () => {
    if (!plateNumber) return;
    setLoading(true);
    try {
      const res = await getVehicleByNumber(plateNumber);
      const vehicle = res.data?.vehicle || res.data;
      setFound(vehicle || false);
    } catch (err) {
      if (err?.response?.status === 404) {
        setFound(false);
      } else if (err?.response?.status === 403) {
        // show message and keep user on register page so they can try another plate or contact support
        if (err?.response?.data?.unauthorized === 1) {
          alert(
            "This plate is registered to another user. If this is your vehicle contact support."
          );
        } else {
          alert("You must be logged in");
          console.log(err?.response?.data?.unauthorized);
        }

        setFound(null);
        // optional: clear plate input or navigate back
        // setPlateNumber("");
        // navigate("/vehicle-register");
      } else if (err?.response?.status === 401) {
        setFound(null);
        alert("You must be logged in");
      } else {
        console.error(err);
        alert("Failed to lookup vehicle");
        setFound(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        plateNumber: plateNumber.toUpperCase(),
        make: form.make,
        model: form.model,
        year: form.year ? Number(form.year) : undefined,
      };
      const res = await createVehicle(payload);
      const created = res.data?.vehicle || res.data;

      console.log("Vehicle created successfully:", {
        response: res.data,
        status: res.status,
        vehicle: created,
      });
      if (!created) throw new Error("No vehicle returned");
      navigate(`/bookings?vehicleId=${created._id || created.id}`);
    } catch (err) {
      console.error("create vehicle error", err);
      alert("Failed to create vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleNextExisting = (vehicle) => {
    navigate(`/bookings?vehicleId=${vehicle._id || vehicle.id}`);
  };

  return (
    <div className="auth-container" style={{ background: "#1a56db" }}>
      <div
        className="auth-wrapper"
        style={{ maxWidth: "880px", width: "100%" }}
      >
        <div className="auth-card" style={{ width: "100%" }}>
          <header style={{ marginBottom: "2rem", textAlign: "center" }}>
            <h1 className="auth-title">Vehicle Registration</h1>
            <p className="auth-subtitle">
              Enter your vehicle details to continue
            </p>
          </header>

          <div className="search-container" style={{ marginBottom: "1.5rem" }}>
            <div className="input-group">
              <input
                value={plateNumber}
                onChange={(e) => {
                  setPlateNumber(e.target.value.toUpperCase());
                  setFound(null);
                }}
                placeholder="Plate number (e.g. ABC1234)"
                className="auth-input"
                style={{ textTransform: "uppercase" }}
              />
              <button
                onClick={checkVehicle}
                className="auth-button"
                style={{ minWidth: "120px" }}
                disabled={loading}
              >
                {loading ? "Checking..." : "Check"}
              </button>
            </div>
          </div>

          {found === null ? null : found === false ? (
            <div
              className="auth-card"
              style={{ padding: "1.5rem", marginTop: "1rem" }}
            >
              <h3 className="section-title">New Vehicle Registration</h3>
              <div className="registration-form">
                <div className="input-grid">
                  <div className="form-group">
                    <input
                      placeholder="Make (e.g. Toyota)"
                      value={form.make}
                      onChange={(e) =>
                        setForm({ ...form, make: e.target.value })
                      }
                      className="auth-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      placeholder="Model (e.g. Corolla)"
                      value={form.model}
                      onChange={(e) =>
                        setForm({ ...form, model: e.target.value })
                      }
                      className="auth-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      placeholder="Year (e.g. 2018)"
                      value={form.year}
                      onChange={(e) =>
                        setForm({ ...form, year: e.target.value })
                      }
                      className="auth-input"
                      type="number"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  className="auth-button"
                  disabled={loading}
                  style={{ width: "100%", marginTop: "1rem" }}
                >
                  {loading ? "Saving..." : "Register Vehicle"}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="auth-card"
              style={{ padding: "1.5rem", marginTop: "1rem" }}
            >
              <h3 className="section-title">Vehicle Found</h3>
              <div className="vehicle-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Plate Number</label>
                    <span>{found.plateNumber || found.plate}</span>
                  </div>
                  <div className="detail-item">
                    <label>Make & Model</label>
                    <span>
                      {(found.make || "-") + " " + (found.model || "")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Year</label>
                    <span>{found.year || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className={`status-badge ${found.status}`}>
                      {found.status || "-"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleNextExisting(found)}
                  className="auth-button"
                  style={{ width: "100%", marginTop: "1rem" }}
                >
                  Continue to Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
