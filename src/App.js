import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

import Header from "./components/Header";
import theme from "./theme";
import Login from "./components/Login";

import {
  getPatients,
  getPatient,
  getRecords,
  addRecord,
  getUsers,
  createUser,
  deleteUser
} from "./api";
import { getMedicines } from "./api";

import Pharmacy from "./components/Pharmacy";
import Reception from "./components/Reception";
import PatientSearch from "./components/PatientSearch";
import Dashboard from "./components/Dashboard";
import Medicines from "./components/Medicines";
import Sales from "./components/Sales";
import StockMovements from "./components/StockMovements";

function App() {

  // =========================
  // STATE
  // =========================
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const updateNote = (field, value) => {
    setNotes(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const [medicines, setMedicines] = useState([]);

  const [notes, setNotes] = useState({
    chief_complaint: "",
    hpi: "",
    ros: "",
    pmhx: "",
    shx: "",
    fshx: "",
    psxh: "",
    ge: "",
    gps: "",
    se: "",
    dx: "",
    ddx: ""
  });
  // const [testResults, setTestResults] = useState("");
  // const [prescription, setPrescription] = useState("");

  const [notifications, setNotifications] = useState(0);

  const [role, setRole] = useState(null);
  const [view, setView] = useState(null);
  const [showRecords, setShowRecords] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [prescriptionItems, setPrescriptionItems] = useState([]);

  // ADMIN STATE
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "doctor"
  });

  const isRecordValid =
    notes.chief_complaint.trim().length > 0 ||
    notes.dx.trim().length > 0;

  useEffect(() => {
    const load = async () => {
      const res = await getMedicines();
      setMedicines(res?.data || []);
    };

    load();
  }, []);

  // =========================
  // AUTH INITIALIZATION
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (!token) {
      setRole(null);
      setView("login");
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const allowedRoles = ["doctor", "reception", "pharmacy", "admin"];

    setRole(savedRole);

    if (allowedRoles.includes(savedRole)) {

      if (savedRole === "admin") {
        setView("dashboard");
      } else {
        setView(savedRole);
      }

    }

  }, []);

  // =========================
  // FETCH PATIENTS
  // =========================
  useEffect(() => {
    const loadPatients = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const res = await getPatients();

        const sorted = Array.isArray(res?.data)
          ? [...res.data].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
          : [];

        setPatients(sorted);

      } catch (err) {
        console.error("Error loading patients:", err);
      }
    };

    loadPatients();
  }, [view]);

  // =========================
  // LOAD USERS (ADMIN FIX)
  // =========================
  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (view !== "admin") return;

        const res = await getUsers();
        const rawUsers = res?.data || [];

        // ✅ REMOVE DUPLICATES SAFELY BY ID
        const uniqueUsers = Array.from(
          new Map(rawUsers.map(u => [u.id, u])).values()
        );

        setUsers(uniqueUsers);

      } catch (err) {
        console.error("Error loading users:", err);
      }
    };

    loadUsers();
  }, [view]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setRole(null);
    setView("login");
  };
  // =========================
  // VIEW PATIENT
  // =========================
  const viewPatient = async (id) => {
    if (!id) return;

    try {
      setSelectedPatient(null);
      setRecords([]);
      setShowRecords(false);

      const res1 = await getPatient(id);
      setSelectedPatient(res1?.data || null);

      const res2 = await getRecords(id);

      const sorted = Array.isArray(res2?.data)
        ? [...res2.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
        : [];

      setRecords(sorted);

    } catch (err) {
      console.error("Error loading patient:", err);
    }
  };

  // =========================
  // AGE CALCULATION
  // =========================
  const calculateAge = (dob) => {
    if (!dob) return null;

    const today = new Date();
    const birth = new Date(dob);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // =========================
  // ADD RECORD
  // =========================
  const handleAddRecord = async () => {

    try {

      if (!selectedPatient) return;
      if (!isRecordValid) return;

      setSaving(true);
      setSaveError(false);
      setSaveSuccess(false);

      // =========================
      // BUILD PAYLOAD
      // =========================
      const payload = {
        patient_id: selectedPatient.id,

        diagnosis: notes.dx || "",
        test_results: notes.investigations || "",
        prescription: "",

        notes: notes,

        prescription_items: prescriptionItems.map((item) => ({
          medicine_id:
            item.medicine_id || item.medicine,

          quantity:
            Number(item.quantity || item.dose || 1),

          instructions:
            item.instructions || ""
        }))
      };

      console.log(payload);

      // =========================
      // SAVE RECORD
      // =========================
      await addRecord(payload);

      // =========================
      // REFRESH RECORDS
      // =========================
      const updated = await getRecords(selectedPatient.id);

      const sorted = Array.isArray(updated?.data)
        ? [...updated.data].sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        )
        : [];

      setRecords(sorted);

      // =========================
      // RESET NOTES
      // =========================
      setNotes({
        chief_complaint: "",
        hpi: "",
        ros: "",
        pmhx: "",
        shx: "",
        fshx: "",
        psxh: "",
        ge: "",
        gps: "",
        se: "",
        dx: "",
        ddx: ""
      });

      setPrescriptionItems([]);

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);

    } catch (err) {

      console.error(err);

      console.log(
        err?.response?.data
      );

      setSaveError(true);

      setTimeout(() => {
        setSaveError(false);
      }, 2500);

    } finally {

      setSaving(false);

    }
  };

  // =========================
  // CREATE USER (FIXED)
  // =========================
  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.password) return;

      await createUser(newUser);

      const res = await getUsers();
      setUsers(res?.data || []);

      setNewUser({
        username: "",
        password: "",
        role: "doctor"
      });

    } catch (err) {
      console.error("Create user error:", err);
    }
  };

  // =========================
  // DELETE USER (FIXED)
  // =========================
  const handleDeleteUser = async (id) => {
    try {
      console.log("Attempting to delete user:", id);

      const res = await deleteUser(id);
      console.log("Delete response:", res);

      // IMPORTANT: small delay ensures backend finishes commit
      setTimeout(async () => {
        const updatedUsers = await getUsers();
        console.log("Updated users after delete:", updatedUsers);

        setUsers(updatedUsers?.data || []);
      }, 200);

    } catch (err) {
      console.error("Delete user error:", err);

      alert(
        err?.response?.data?.error ||
        "Delete failed. Check backend or permissions."
      );
    }
  };

  // =========================
  // VIEW SWITCH
  // =========================
  const renderView = () => {

    if (view === "login") {
      return <Login setRole={setRole} setView={setView} />;
    }

    if (view === "dashboard") {
      return <Dashboard />;
    }

    if (view === "pharmacy") {
      return (
        <Pharmacy
          setNotifications={setNotifications}
          setView={setView}
        />
      );
    }

    if (view === "reception") {
      return <Reception />;
    }

    if (view === "medicines") {
      return <Medicines />;
    }

    if (view === "sales") {
      return <Sales />;
    }

    if (view === "stock") {
      return <StockMovements />;
    }

    if (view === "admin") {
      return (
        <div style={{ padding: "20px" }} id="admin-dashboard">

          <h2>👑 Admin Dashboard</h2>

          {/* ================= CREATE USER ================= */}
          <div className="card">
            <h3>Create User</h3>

            <input
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />

            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <option value="doctor">Doctor</option>
              <option value="reception">Reception</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="admin">Admin</option>
            </select>

            <button style={theme.button} onClick={handleCreateUser}>
              Create User
            </button>
          </div>

          {/* ================= USERS ================= */}
          <div className="card">
            <h3>Users</h3>

            {users.length === 0 ? (
              <p>No users yet</p>
            ) : (
              users.map((u) => (
                <div key={u.id} className="admin-user-row">

                  <div className="admin-col name">
                    <b>{u.username}</b>
                  </div>

                  <div className="admin-col role">
                    {u.role}
                  </div>

                  <div className="admin-col action">
                    <button onClick={() => handleDeleteUser(u.id)}>
                      Delete
                    </button>
                  </div>

                  <div className="admin-col status">
                    <span
                      className={`user-badge ${u.active === false || u.status === "disabled"
                        ? "badge-disabled"
                        : "badge-active"
                        }`}
                    >
                      {u.active === false || u.status === "disabled"
                        ? "DISABLED"
                        : "ACTIVE"}
                    </span>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* ================= PATIENT ACCESS (NEW) ================= */}
          <div className="card">
            <h3>🏥 All Patients (Admin Access)</h3>

            <PatientSearch
              onSelect={(patient) => viewPatient(patient.id)}
            />

            <div
              className="patient-list"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "15px"
              }}
            >
              {patients.map((p) => (

                <div
                  key={p.id}
                  className="patient-card"
                  onClick={() => viewPatient(p.id)}
                  style={{
                    cursor: "pointer"
                  }}
                >

                  <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                    {p.first_name} {p.last_name}
                  </h3>

                  <div className="patient-grid">

                    <div className="patient-field">
                      <span className="label">Patient ID</span>
                      <span className="value">{p.id}</span>
                    </div>

                    <div className="patient-field">
                      <span className="label">Gender</span>
                      <span className="value">{p.gender || "N/A"}</span>
                    </div>

                    <div className="patient-field">
                      <span className="label">Date of Birth</span>
                      <span className="value">
                        {p.date_of_birth || "N/A"}
                      </span>
                    </div>

                    <div className="patient-field">
                      <span className="label">National ID</span>
                      <span className="value">
                        {p.national_id || "N/A"}
                      </span>
                    </div>

                    <div className="patient-field">
                      <span className="label">Phone</span>
                      <span className="value">
                        {p.phone || p.phone_number || "N/A"}
                      </span>
                    </div>

                    <div className="patient-field">
                      <span className="label">Address</span>
                      <span className="value">
                        {p.address || "N/A"}
                      </span>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ================= RECORD VIEW CONTROL ================= */}
          <div className="card">
            <h3>📜 Patient Records</h3>

            <button
              style={theme.button}
              onClick={() => setShowRecords(prev => !prev)}
            >
              {showRecords ? "Hide Records" : "See Records"}
            </button>

            {showRecords && (
              <div style={{ marginTop: "15px" }}>
                {records.length === 0 ? (
                  <p>No records</p>
                ) : (
                  records.map((r) => (
                    <div key={r.id} className="record-card">
                      {r.notes_json ? (
                        <>
                          {(() => {
                            const n = JSON.parse(r.notes_json);

                            return (
                              <>
                                <p><b>Chief Complaint:</b> {n.chief_complaint}</p>
                                <p><b>HPI:</b> {n.hpi}</p>
                                <p><b>ROS:</b> {n.ros}</p>
                                <p><b>PMHx:</b> {n.pmhx}</p>
                                <p><b>SHx:</b> {n.shx}</p>
                                <p><b>FSHx:</b> {n.fshx}</p>
                                <p><b>PSHx:</b> {n.psxh}</p>
                                <p><b>GE:</b> {n.ge}</p>
                                <p><b>GPs:</b> {n.gps}</p>
                                <p><b>SE:</b> {n.se}</p>
                                <p><b>DX:</b> {n.dx}</p>
                                <p><b>DDx:</b> {n.ddx}</p>
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <>
                          <p><b>Diagnosis:</b> {r.diagnosis}</p>
                          <p><b>Prescription:</b> {r.prescription}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      );
    }
    return (
      <div className="doctor-layout">

        <div className="doctor-left">

          <div className="card">
            <h2>👨‍⚕️ Doctor Dashboard</h2>

          </div>

          <div className="card" style={{ overflow: "visible" }}>
            <h3>🔍 Search Patient</h3>

            <div style={{ position: "relative", zIndex: 20 }}>
              <PatientSearch
                onSelect={(patient) => viewPatient(patient.id)}
              />
            </div>
          </div>

          <div className="card">
            <h3>📋 Patients</h3>

            <div className="patient-list">
              {patients.map((p) => (
                <div
                  key={p.id}
                  className={`patient-card ${selectedPatient?.id === p.id ? "active-patient" : ""
                    }`}
                  onClick={() => viewPatient(p.id)}
                >
                  <b>{p.first_name} {p.last_name}</b>
                  <div>ID: {p.id}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="doctor-right">

          <div className="card">
            <h2>🧾 Patient Details</h2>

            {selectedPatient ? (
              <>
                <p><b>Name:</b> {selectedPatient.first_name} {selectedPatient.last_name}</p>
                <p><b>Age:</b> {calculateAge(selectedPatient.date_of_birth)}</p>
                <p><b>Gender:</b> {selectedPatient.gender}</p>
                <p><b>National ID:</b> {selectedPatient.national_id || "N/A"}</p>

                <h3>➕ Add Record</h3>

                <div className="clinical-section">

                  <div className="clinical-section">
                    <h3>🧠 Clinical Notes</h3>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "12px"
                    }}>

                      <textarea placeholder="Chief Complaint"
                        value={notes.chief_complaint}
                        onChange={(e) => updateNote("chief_complaint", e.target.value)}
                      />

                      <textarea placeholder="HPI"
                        value={notes.hpi}
                        onChange={(e) => updateNote("hpi", e.target.value)}
                      />

                      <textarea placeholder="ROS"
                        value={notes.ros}
                        onChange={(e) => updateNote("ros", e.target.value)}
                      />

                      <textarea placeholder="PMHx"
                        value={notes.pmhx}
                        onChange={(e) => updateNote("pmhx", e.target.value)}
                      />

                      <textarea placeholder="SHx"
                        value={notes.shx}
                        onChange={(e) => updateNote("shx", e.target.value)}
                      />

                      <textarea placeholder="FSHx"
                        value={notes.fshx}
                        onChange={(e) => updateNote("fshx", e.target.value)}
                      />

                      <textarea placeholder="PSHx"
                        value={notes.psxh}
                        onChange={(e) => updateNote("psxh", e.target.value)}
                      />

                      <textarea placeholder="GE"
                        value={notes.ge}
                        onChange={(e) => updateNote("ge", e.target.value)}
                      />

                      <textarea placeholder="GPs"
                        value={notes.gps}
                        onChange={(e) => updateNote("gps", e.target.value)}
                      />

                      <textarea placeholder="SE"
                        value={notes.se}
                        onChange={(e) => updateNote("se", e.target.value)}
                      />

                      <textarea placeholder="DX"
                        value={notes.dx}
                        onChange={(e) => updateNote("dx", e.target.value)}
                      />

                      <textarea placeholder="DDx"
                        value={notes.ddx}
                        onChange={(e) => updateNote("ddx", e.target.value)}
                      />

                    </div>
                  </div>

                </div>
                <div className="clinical-section">
                  <h3>💊 Prescription</h3>

                  <button
                    style={theme.button}
                    onClick={() => setPrescriptionItems([
                      ...prescriptionItems,
                      { medicine_id: null, medicine_name: "", quantity: 1, instructions: "" }
                    ])}
                  >
                    + Add Medicine
                  </button>

                  {prescriptionItems.map((item, index) => (
                    <div key={index} style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr auto",
                      gap: "10px",
                      marginTop: "10px"
                    }}>

                      <select
                        value={item.medicine_id || ""}
                        onChange={(e) => {
                          const copy = [...prescriptionItems];

                          const selected = medicines.find(
                            (m) => m.id === Number(e.target.value)
                          );

                          copy[index].medicine_id = selected.id;
                          copy[index].medicine_name = selected.name;

                          setPrescriptionItems(copy);
                        }}
                      >
                        <option value="">Select medicine</option>

                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>

                      <input
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => {
                          const copy = [...prescriptionItems];
                          copy[index].quantity = e.target.value;
                          setPrescriptionItems(copy);
                        }}
                      />

                      <input
                        placeholder="Instructions"
                        value={item.instructions}
                        onChange={(e) => {
                          const copy = [...prescriptionItems];
                          copy[index].instructions = e.target.value;
                          setPrescriptionItems(copy);
                        }}
                      />

                      <button
                        onClick={() => {
                          setPrescriptionItems(
                            prescriptionItems.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        ❌
                      </button>

                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddRecord}
                  disabled={saving || !isRecordValid}
                  style={{
                    ...theme.button,
                    background: saveError
                      ? "red"
                      : saveSuccess
                        ? "green"
                        : "#2563eb"
                  }}
                >
                  {saving
                    ? "Saving..."
                    : saveError
                      ? "Error"
                      : saveSuccess
                        ? "Saved"
                        : "Save Record"}
                </button>

              </>
            ) : (
              <p>Select a patient</p>
            )}

            <br /><br />

            <button
              style={theme.button}
              onClick={() => setShowRecords(prev => !prev)}
            >
              📜 Medical History
            </button>

            {showRecords && (
              <div style={{ marginTop: "15px" }}>
                {records.length === 0 ? (
                  <p>No records</p>
                ) : (
                  records.map((r) => {
                    const n = r.notes_json ? JSON.parse(r.notes_json) : null;

                    return (
                      <div key={r.id} className="record-card">

                        {n ? (
                          <>
                            <p><b>Chief Complaint:</b> {n.chief_complaint}</p>
                            <p><b>HPI:</b> {n.hpi}</p>
                            <p><b>ROS:</b> {n.ros}</p>
                            <p><b>PMHx:</b> {n.pmhx}</p>
                            <p><b>SHx:</b> {n.shx}</p>
                            <p><b>FSHx:</b> {n.fshx}</p>
                            <p><b>PSHx:</b> {n.psxh}</p>
                            <p><b>General Exam:</b> {n.ge}</p>
                            <p><b>General Physical Signs:</b> {n.gps}</p>
                            <p><b>Systemic Exam:</b> {n.se}</p>
                            <p><b>Diagnosis:</b> {n.dx}</p>
                            <p><b>DDx:</b> {n.ddx}</p>
                          </>
                        ) : (
                          <>
                            <p><b>Diagnosis:</b> {r.diagnosis}</p>
                            <p><b>Prescription:</b> {r.prescription}</p>
                          </>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    );
  };

  return (
    <div className="app-container">

      <Header
        notifications={notifications}
        role={role}
        setView={setView}
        logout={handleLogout}
      />

      <div className="app-content">
{(role === "admin" || role === "pharmacy") && (
  <div
    className="card"
    style={{
      margin: "20px",
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    }}
  >

    {role === "admin" && (
      <>
        <button onClick={() => setView("dashboard")}>
          Dashboard
        </button>

        <button onClick={() => setView("admin")}>
          Admin
        </button>

        <button onClick={() => setView("medicines")}>
          Medicines
        </button>

        <button onClick={() => setView("stock")}>
          Stock Movements
        </button>
      </>
    )}

    <button onClick={() => setView("pharmacy")}>
      Pharmacy
    </button>

    <button onClick={() => setView("sales")}>
      Sales
    </button>

          </div>
        )}

        {renderView()}

      </div>
      <div className="app-footer">
        <span>
          Built by  Derrick Meitaron 0705067151 © {new Date().getFullYear()}
        </span>
      </div>

    </div>
  );
}

export default App;