import React, { useEffect, useState, useCallback, useRef } from "react";
import theme from "../theme";
import {
  getPendingPrescriptions,
  getPrescriptionDetails,
  dispensePrescription,
  searchPatients,
} from "../api";

import notifySound from "../assets/notify.mp3";

function Pharmacy({ setNotifications, setView }) {

  const [queue, setQueue] = useState([]);
  const [patient, setPatient] = useState(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [mode, setMode] = useState("QUEUE");

  const prevQueueLengthRef = useRef(0);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loadingDispense, setLoadingDispense] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // =========================
  // SORT
  // =========================
  const sortByCreatedAt = (data) => {
    if (!Array.isArray(data)) return [];
    return [...data].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  };

  // =========================
  // QUEUE
  // =========================
  const loadQueue = useCallback(async () => {
    try {

      const res = await getPendingPrescriptions();

      // SUPPORT BOTH:
      // res.data.data
      // OR res.data
      const queueData =
        res?.data?.data ||
        res?.data ||
        [];

      const sorted = sortByCreatedAt(queueData);

      // play sound if new patient added
      if (sorted.length > prevQueueLengthRef.current) {

        const audio = new Audio(notifySound);

        audio.play().catch(() => { });

        showToast(
          "New prescription added to queue",
          "info"
        );
      }

      setQueue(sorted);

      // update notifications
      setNotifications(sorted.length);

      prevQueueLengthRef.current = sorted.length;

    } catch (err) {

      console.error("Queue load failed:", err);

      setQueue([]);
      setNotifications(0);
    }
  }, [setNotifications]);
  // =========================
  // SEARCH (UNIFIED)
  // =========================
  const handleSearch = useCallback(async (text) => {
    try {
      if (!text.trim()) {
        setResults([]);
        return;
      }

      const res = await searchPatients(text);
      setResults(res.data || []);

    } catch (err) {
      console.error(err);
      setResults([]);
    }
  }, []);

  // =========================
  // SELECT PATIENT
  // =========================
  const selectPatient = async (p) => {
    setPatient(p);
    setQuery("");
    setResults([]);

    setMode("SEARCH");
  };

  const openPrescription = async (id) => {
    try {
      const res = await getPrescriptionDetails(id);
      setSelectedPrescription(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // DISPENSE
  // =========================
  const handleDispense = async () => {

    if (!selectedPrescription) return;

    try {

      setLoadingDispense(true);

      await dispensePrescription(
        selectedPrescription.prescription.id,
        {
          payment_method: paymentMethod
        }
      );

      showToast("Prescription dispensed successfully");

      setSelectedPrescription(null);

      await loadQueue();

    } catch (err) {
      console.error(err);
      showToast("Dispense failed", "error");
    } finally {
      setLoadingDispense(false);
    }
  };

  const showToast = (message, type = "success") => {

    setToast({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setToast(prev => ({
        ...prev,
        show: false
      }));
    }, 3000);
  };
  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(query);
    }, 400);

    return () => clearTimeout(delay);
  }, [query, handleSearch]);

  // =========================
  // UI
  // =========================
  return (
    <div style={theme.container}>
      <div style={theme.header}>💊 Pharmacy Dashboard</div>
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 5000,
            minWidth: "300px",
            padding: "16px 20px",
            borderRadius: "12px",
            color: "#fff",
            fontWeight: "600",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            background:
              toast.type === "success"
                ? "#16a34a"
                : toast.type === "error"
                  ? "#dc2626"
                  : "#2563eb",
            animation: "slideIn 0.3s ease"
          }}
        >
          {toast.message}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <div className="nav-buttons">

          <button
            style={theme.button}
            onClick={() => setMode("QUEUE")}
          >
            Queue Mode
          </button>

          <button
            style={theme.button}
            onClick={() => setMode("SEARCH")}
          >
            Search Mode
          </button>

          <button onClick={() => setView("sales")}>
            Sales
          </button>

        </div>
      </div>

      {/* =========================
          QUEUE MODE
      ========================= */}
      {mode === "QUEUE" && (
        <div>
          <h3>Live Queue</h3>

          {queue.map((item) => (
            <div key={item.prescription_id} style={theme.card}>
              <p><b>{item.first_name} {item.last_name}</b></p>
              <p>
                <b>Prescription ID:</b> #{item.prescription_id}
              </p>

              <p>
                <b>Status:</b> {item.status}
              </p>

              <button
                style={{ ...theme.button, backgroundColor: "green" }}
                onClick={() => openPrescription(item.prescription_id)}
              >
                Open Prescription
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          SEARCH MODE (UNIFIED)
      ========================= */}
      {mode === "SEARCH" && (
        <div>
          <h3>Search Patient</h3>

          <div style={{ position: "relative" }}>
            <input
              className="input-animated"
              placeholder="Search patient (name, ID, NID...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {results.length > 0 && (
              <div style={{
                position: "absolute",
                background: "#fff",
                border: "1px solid #ccc",
                width: "100%",
                zIndex: 999
              }}>
                {results.map((p) => (
                  <div
                    key={p.id}
                    style={{ padding: "10px", cursor: "pointer" }}
                    onClick={() => selectPatient(p)}
                  >
                    <b>{p.first_name} {p.last_name}</b>
                    <div>ID: {p.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {patient && (
            <div style={theme.card}>
              <h3>Patient Info</h3>
              <p>{patient.first_name} {patient.last_name}</p>
            </div>
          )}

        </div>
      )}

      {selectedPrescription && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            width: "500px",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>

            <h2>
              Prescription #{selectedPrescription.prescription.id}
            </h2>

            <p>
              <b>Patient:</b>{" "}
              {selectedPrescription.patient.first_name}{" "}
              {selectedPrescription.patient.last_name}
            </p>

            <hr />

            {selectedPrescription.items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #eee"
                }}
              >
                <b>{item.medicine_name}</b>

                <div>
                  Qty: {item.quantity}
                </div>

                <div>
                  Instructions: {item.instructions || "-"}
                </div>
              </div>
            ))}

            <div style={{ marginTop: "20px" }}>
              <label>Payment Method</label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="mpesa">Mpesa</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>

            <div style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px"
            }}>
              <button
                style={{
                  ...theme.button,
                  backgroundColor: "green"
                }}
                disabled={loadingDispense}
                onClick={handleDispense}
              >
                {loadingDispense
                  ? "Processing..."
                  : "Confirm Dispense"}
              </button>

              <button
                style={theme.button}
                onClick={() => setSelectedPrescription(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
export default Pharmacy;