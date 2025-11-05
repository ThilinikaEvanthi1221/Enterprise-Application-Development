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
      if (vehicle) setFound(vehicle);
      else setFound(false);
    } catch (err) {
      if (err?.response?.status === 404) setFound(false);
      else {
        console.error(err);
        setFound(false);
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
    <div style={{ padding: 24 }}>
      <header className="bookings-header">
        <div className="header-left">
          <h1 className="page-title">Vehicle Register</h1>
          <p className="page-subtitle">Enter plate number to continue</p>
        </div>
      </header>

      <div style={{ marginTop: 16, maxWidth: 880 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <input
            value={plateNumber}
            onChange={(e) => {
              setPlateNumber(e.target.value.toUpperCase());
              setFound(null);
            }}
            placeholder="Plate number (e.g. ABC1234)"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          />
          <button
            onClick={checkVehicle}
            className="btn primary"
            style={{ minWidth: 110 }}
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>

        {found === null ? null : found === false ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Vehicle not registered — add details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <input
                placeholder="Make (e.g. Toyota)"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <input
                placeholder="Model (e.g. Corolla)"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <input
                placeholder="Year (e.g. 2018)"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={handleCreate} className="btn primary">
                {loading ? "Saving..." : "Next"}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Vehicle found</h3>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {found.plateNumber || found.plate}
                </div>
                <div style={{ color: "#6b7280" }}>
                  {(found.make || "-") + " " + (found.model || "")}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{found.year || "-"}</div>
                <div style={{ color: "#6b7280" }}>Year</div>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{found.status || "-"}</div>
                <div style={{ color: "#6b7280" }}>Status</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => handleNextExisting(found)}
                className="btn primary"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
