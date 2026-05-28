import React, { useState, useEffect } from "react";
import theme from "../theme";
import api, { searchPatients } from "../api"; // ✅ FIX: use shared api

function Reception() {

  // =========================
  // REGISTRATION STATE
  // =========================
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    phone: "",
    date_of_birth: "",
    national_id: "",
    guardian_national_id: ""
  });

  const [age, setAge] = useState(null);

  // =========================
  // LIVE SEARCH STATE
  // =========================
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [patient, setPatient] = useState(null);

  // =========================
  // GENERAL STATE
  // =========================
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // HANDLE FORM INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === "date_of_birth") {
      const today = new Date();
      const dob = new Date(value);

      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    }
  };

  // =========================
  // REGISTER PATIENT
  // =========================
  const registerPatient = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!form.first_name || !form.last_name || !form.date_of_birth) {
        setMessage("Please fill all required fields");
        return;
      }

      if (age >= 18 && !form.national_id) {
        setMessage("Adult must have National ID");
        return;
      }

      if (age < 18 && !form.guardian_national_id) {
        setMessage("Child must have Guardian National ID");
        return;
      }

      const res = await api.post("/add_patient", form);

      setMessage(res.data.message);

      setForm({
        first_name: "",
        last_name: "",
        gender: "",
        phone: "",
        date_of_birth: "",
        national_id: "",
        guardian_national_id: ""
      });

      setAge(null);

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LIVE SEARCH (FIXED)
  // =========================
  const liveSearch = async (text) => {
    try {
      if (!text.trim()) {
        setResults([]);
        return;
      }

      setSearchLoading(true);

      // ✅ FIX: uses shared API with interceptor (token included automatically)
      const res = await searchPatients(text);

      const data =
        Array.isArray(res?.data)
          ? res.data
          : [];

      setResults(data);

    } catch (err) {
      console.error("Search error:", err?.response?.data || err);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // =========================
  // DEBOUNCE SEARCH
  // =========================
  useEffect(() => {
    const delay = setTimeout(() => {
      liveSearch(query);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // =========================
  // UI
  // =========================
  return (
    <div style={theme.container}>

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh"
      }}>

        <div style={{ ...theme.card, width: "520px", padding: "30px" }}>

          <div style={theme.header}>🏥 Reception</div>

          {/* =========================
              REGISTER PATIENT
          ========================= */}
          <h3>Register Patient</h3>

          <input className="input-animated" name="first_name" placeholder="First Name" onChange={handleChange} value={form.first_name} />
          <input className="input-animated" name="last_name" placeholder="Last Name" onChange={handleChange} value={form.last_name} />

          <select className="input-animated" name="gender" onChange={handleChange} value={form.gender}>
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input className="input-animated" name="phone" placeholder="Phone" onChange={handleChange} value={form.phone} />
          <input className="input-animated" type="date" name="date_of_birth" onChange={handleChange} value={form.date_of_birth} />

          {age !== null && <p><b>Age:</b> {age} years</p>}

          {age !== null && age >= 18 && (
            <input className="input-animated" name="national_id" placeholder="National ID" onChange={handleChange} value={form.national_id} />
          )}

          {age !== null && age < 18 && (
            <input className="input-animated" name="guardian_national_id" placeholder="Guardian National ID" onChange={handleChange} value={form.guardian_national_id} />
          )}

          <button style={theme.button} onClick={registerPatient} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          {message && <p>{message}</p>}

          <hr />

          {/* =========================
              SEARCH
          ========================= */}
          <h3>Search Patient</h3>

          <div style={{ position: "relative" }}>

            <input
              className="input-animated"
              placeholder="Search by name, ID or guardian ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {searchLoading && <p>Searching...</p>}

            {results.length > 0 && (
              <div style={{
                position: "absolute",
                top: "45px",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                maxHeight: "250px",
                overflowY: "auto",
                zIndex: 99999,
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
              }}>
                {results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setPatient(p);
                      setResults([]);
                      setQuery("");
                    }}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee"
                    }}
                  >
                    <b>{p.first_name} {p.last_name}</b>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      ID: {p.national_id || p.guardian_national_id}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {p.patient_type}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* SELECTED PATIENT */}
          {patient && (
            <div style={{ marginTop: "15px" }}>
              <h4>Patient Selected</h4>
              <p><b>Name:</b> {patient.first_name} {patient.last_name}</p>
              <p><b>Gender:</b> {patient.gender}</p>
              <p><b>Phone:</b> {patient.phone}</p>
              <p><b>National ID:</b> {patient.national_id || "N/A"}</p>
              <p><b>Guardian ID:</b> {patient.guardian_national_id || "N/A"}</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default Reception;