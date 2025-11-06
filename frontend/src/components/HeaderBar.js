import React from "react";
import "../styles/HeaderBar.css"; // You can keep it here if CSS is in /styles

export default function HeaderBar() {
  return (
    <header className="header-bar">
      <div className="header-left">
        <img src="/logo192.png" alt="logo" className="logo" />
        <div>
          <h3>AutoCare Service Center</h3>
          <p>Professional Vehicle Service & Maintenance</p>
        </div>
      </div>

      <div className="header-right">
        <span>🕓 Mon–Sat: 8:00 AM - 6:00 PM</span>
      </div>
    </header>
  );
}
