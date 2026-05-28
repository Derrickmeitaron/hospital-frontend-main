import React, { useState, useEffect, useRef } from "react";
import { searchPatients } from "../api";

export default function PatientSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  // =========================
  // CLICK OUTSIDE TO CLOSE
  // =========================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // DEBOUNCED SEARCH
  // =========================
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }

      try {
        setLoading(true);

        const res = await searchPatients(query);

        // =========================
        // FIXED: robust API parsing
        // =========================
        const data =
          Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data?.patients)
            ? res.data.patients
            : Array.isArray(res?.data?.results)
            ? res.data.results
            : [];

        setResults(data);
        setOpen(true);

      } catch (err) {
        console.error(
          "Search API failed or unexpected format:",
          err?.response?.data || err
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // =========================
  // SELECT PATIENT
  // =========================
  const handleSelect = (p) => {
    setQuery(`${p.first_name} ${p.last_name}`);
    setOpen(false);
    setResults([]);

    // FIX: safe callback (prevents crash in Reception/Pharmacy)
    if (onSelect) {
      onSelect(p);
    }
  };

  // =========================
  // STYLES (UNCHANGED UI)
  // =========================
  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginTop: "5px",
    maxHeight: "250px",
    overflowY: "auto",
    zIndex: 9999,
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
  };

  const itemStyle = {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee"
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>

      <input
        className="input-animated"
        placeholder="Search patient (name, ID, NID, guardian ID...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />

      {loading && (
        <p style={{ fontSize: "12px", marginTop: "5px" }}>
          Searching...
        </p>
      )}

      {open && results.length > 0 && (
        <div style={dropdownStyle}>

          {results.map((p) => (
            <div
              key={p.id}
              style={itemStyle}
              onClick={() => handleSelect(p)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <b>{p.first_name} {p.last_name}</b>

              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                ID: {p.id} | NID: {p.national_id || "N/A"} | Type: {p.patient_type}
              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}