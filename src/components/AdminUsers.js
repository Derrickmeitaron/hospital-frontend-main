import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const disableUser = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // STATS
  // =========================
  const total = users.length;
  const active = users.filter(u => u.status !== "disabled").length;
  const disabled = users.filter(u => u.status === "disabled").length;

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🧠 Admin Control Center</h2>
          <p style={styles.subtitle}>User management & system access control</p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{total}</div>
            <div style={styles.statLabel}>Users</div>
          </div>

          <div style={styles.statBox}>
            <div style={{ ...styles.statNumber, color: "#22c55e" }}>{active}</div>
            <div style={styles.statLabel}>Active</div>
          </div>

          <div style={styles.statBox}>
            <div style={{ ...styles.statNumber, color: "#ef4444" }}>{disabled}</div>
            <div style={styles.statLabel}>Disabled</div>
          </div>
        </div>
      </div>

      {/* USERS GRID */}
      <div style={styles.grid}>
        {users.map((u) => {
          const isDisabled = u.status === "disabled";

          return (
            <div
              key={u.id}
              style={{
                ...styles.card,
                opacity: isDisabled ? 0.65 : 1,
                borderLeft: isDisabled
                  ? "4px solid #ef4444"
                  : "4px solid #22c55e",
              }}
            >
              {/* TOP ROW */}
              <div style={styles.row}>
                <div>
                  <div style={styles.username}>
                    {u.username || "Unknown"}
                  </div>

                  <div style={styles.role}>
                    {u.role || "no-role"}
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div
                  style={{
                    ...styles.badge,
                    background: isDisabled ? "#fee2e2" : "#dcfce7",
                    color: isDisabled ? "#b91c1c" : "#166534",
                  }}
                >
                  {isDisabled ? "DISABLED" : "ACTIVE"}
                </div>
              </div>

              {/* INFO SECTION */}
              <div style={styles.info}>
                <div>
                  <span style={styles.label}>User ID:</span> {u.id}
                </div>

                <div>
                  <span style={styles.label}>Role:</span> {u.role}
                </div>
              </div>

              {/* ACTIONS */}
              {!isDisabled && (
                <button
                  onClick={() => disableUser(u.id)}
                  style={styles.button}
                >
                  Disable User
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================
// STYLES (MODERN ADMIN UI)
// =========================
const styles = {
  page: {
    padding: "25px",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#e2e8f0",
    fontFamily: "system-ui, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    padding: "20px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "14px",
    backdropFilter: "blur(10px)",
  },

  title: {
    margin: 0,
    fontSize: "22px",
  },

  subtitle: {
    margin: 0,
    fontSize: "13px",
    opacity: 0.7,
  },

  stats: {
    display: "flex",
    gap: "12px",
  },

  statBox: {
    textAlign: "center",
    padding: "10px 15px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.06)",
  },

  statNumber: {
    fontSize: "18px",
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: "11px",
    opacity: 0.7,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "15px",
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "15px",
    transition: "0.2s ease",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  username: {
    fontWeight: "bold",
    fontSize: "16px",
  },

  role: {
    fontSize: "12px",
    opacity: 0.7,
  },

  badge: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },

  info: {
    fontSize: "12px",
    opacity: 0.85,
    marginBottom: "12px",
  },

  label: {
    opacity: 0.6,
  },

  button: {
    width: "100%",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#ef4444",
    color: "white",
    fontWeight: "bold",
    transition: "0.2s",
  },
};