import React, { useState } from "react";
import axios from "axios";
import { loginUser } from "../api";

export default function Login({ setRole, setView }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      // Call backend through API wrapper (important)
      const res = await loginUser({ username, password });

      console.log("LOGIN RAW RESPONSE:", res);

      const data = res?.data;

      if (!data) {
        throw new Error("Empty server response");
      }

      const token = data.token || data?.access_token;
      const role = data.role || data?.user?.role;

      if (!token) {
        throw new Error("Invalid server response: missing token");
      }

      if (!role) {
        throw new Error("Invalid server response: missing role");
      }

      // Save auth
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Set axios default header globally
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setRole(role);

      // route user
      if (setView) {
        setRole(role);
        setView(role);
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Invalid server response"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes rainbowGlow {
            0% { box-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000; border-color: #ff0000; }
            20% { box-shadow: 0 0 5px #ff9900, 0 0 10px #ff9900; border-color: #ff9900; }
            40% { box-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00; border-color: #00ff00; }
            60% { box-shadow: 0 0 5px #00ccff, 0 0 10px #00ccff; border-color: #00ccff; }
            80% { box-shadow: 0 0 5px #6600ff, 0 0 10px #6600ff; border-color: #6600ff; }
            100% { box-shadow: 0 0 5px #ff00cc, 0 0 10px #ff00cc; border-color: #ff00cc; }
          }

          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }

          .login-card { animation: fadeSlideIn 0.5s ease; }
          .error-shake { animation: shake 0.3s; }

          .rainbow-input:focus {
            animation: rainbowGlow 2s linear infinite;
          }

          .login-button:hover {
            transform: translateY(-2px);
          }
        `}
      </style>

      <div
        className={`login-card ${error ? "error-shake" : ""}`}
        style={{ maxWidth: "350px", margin: "100px auto" }}
      >
        <div style={styles.card}>
          <h2 style={styles.title}>🏥 Hospital System Login</h2>
          <p style={styles.subtitle}>Sign in to continue</p>

          {/* USERNAME */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              className="rainbow-input"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                className="rainbow-input"
                style={styles.passwordInput}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleOutside}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* LOGIN */}
          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading || !username || !password}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          {/* ERROR */}
          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  card: {
    width: "360px",
    padding: "30px",
    borderRadius: "14px",
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
  },
  title: { textAlign: "center" },
  subtitle: { textAlign: "center", fontSize: "13px", color: "#666" },
  inputGroup: { marginBottom: "15px" },
  label: { fontSize: "13px", marginBottom: "5px", display: "block" },

  input: {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },

  passwordInput: {
    flex: 1,
    padding: "11px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },

  toggleOutside: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#2563eb"
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    border: "none"
  },

  errorBox: {
    marginTop: "12px",
    padding: "10px",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
    fontSize: "13px",
    textAlign: "center"
  }
};