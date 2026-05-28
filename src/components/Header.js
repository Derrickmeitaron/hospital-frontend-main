import React from "react";
import logo from "../assets/logo.png";

export default function Header({ notifications = 0, role, setView, logout }) {
  


  return (
    <div className="app-header">

      {/* LEFT */}
      <div className="header-left">
        <img src={logo} alt="logo" className="logo" />

        <div className="title">
          <h1>Elang'ata Sidai Medical Centre</h1>
          <span className="subtitle">Hospital Management System</span>
        </div>
      </div>

      {/* CENTER */}
      <div className="header-center">
        <span className="role-badge">
          👤 {role ? role.toUpperCase() : "GUEST"}
        </span>
      </div>

      {/* RIGHT */}
      <div className="header-right">

        {/* PHARMACY ONLY NOTIFICATIONS */}
        {role === "pharmacy" && (
          <div className="notif">
            🔔

            {notifications > 0 && (
              <span className="notif-badge">
                {notifications}
              </span>
            )}
          </div>
        )}

        {/* LOGOUT ONLY WHEN LOGGED IN */}
        {role && role !== "login" && (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        )}
        

      </div>
      

    </div>
    
  );
  
}
