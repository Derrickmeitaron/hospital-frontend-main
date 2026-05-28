import React, { useEffect, useState } from "react";

import {
  getMedicines,
  getPatients,
  createSale,
  getSales
} from "../api";

function Sales() {

  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [sales, setSales] = useState([]);

  const [patientId, setPatientId] = useState("");

  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([
    {
      medicine_id: "",
      quantity: 1
    }
  ]);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    try {
      const meds = await getMedicines();
      setMedicines(meds?.data || []);
      const pats = await getPatients();
      setPatients(pats?.data || []);

      const saleRes = await getSales();
      setSales(saleRes?.data || []);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // =========================
  // HANDLE ITEM CHANGE
  // =========================
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // =========================
  // ADD ITEM ROW
  // =========================
  const addItemRow = () => {
    setItems([...items, { medicine_id: "", quantity: 1 }]);
  };

  // =========================
  // REMOVE ITEM
  // =========================
  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // =========================
  // CALCULATE TOTAL
  // =========================
  const calculateTotal = () => {
    let total = 0;

    items.forEach((item) => {
      const med = medicines.find(
        (m) => String(m.id) === String(item.medicine_id)
      );

      if (med) {
        total +=
          Number(med.selling_price) *
          Number(item.quantity);
      }
    });

    return total;
  };

  // =========================
  // VALIDATE ITEMS
  // =========================
  const isValidItems = items.every(
    (i) => i.medicine_id && i.quantity > 0
  );

  // =========================
  // CREATE SALE
  // =========================
  const handleCreateSale = async () => {
    try {

      if (!patientId) {
        showMessage("Please select a patient", "error");
        return;
      }

      if (!isValidItems) {
        showMessage("Fill all medicine items properly", "error");
        return;
      }

      setLoading(true);

      const payload = {
        patient_id: patientId,
        sold_by: localStorage.getItem("user_id") || 1,
        payment_method: paymentMethod,
        items: items.map(i => ({
          medicine_id: i.medicine_id,
          quantity: Number(i.quantity)
        }))
      };

      await createSale(payload);

      showMessage("Sale completed successfully", "success");

      setItems([{ medicine_id: "", quantity: 1 }]);
      setPatientId("");

      await loadData();

    } catch (err) {
      console.error(err);

      showMessage(
        err?.response?.data?.error || "Sale failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "25px",
        background: "#f3f4f6",
        minHeight: "100vh"
      }}
    >

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px"
        }}
      >

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#111827"
            }}
          >
            🧾 Pharmacy POS
          </h1>

          <p
            style={{
              marginTop: "5px",
              color: "#6b7280"
            }}
          >
            Manage pharmacy sales professionally
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: "15px 20px",
            borderRadius: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}
        >
          <div style={{ color: "#6b7280", fontSize: "14px" }}>
            Total Items
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2563eb"
            }}
          >
            {items.length}
          </div>
        </div>
      </div>

      {/* CREATE SALE */}
      <div
        style={{
          background: "white",
          borderRadius: "18px",
          padding: "25px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          marginBottom: "25px"
        }}
      >

        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#111827"
          }}
        >
          Create Sale
        </h2>

        {/* PATIENT */}
        <div style={{ marginBottom: "20px" }}>

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600"
            }}
          >
            Select Patient
          </label>

          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db"
            }}
          >
            <option value="">Select Patient</option>

            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </select>

        </div>

        {/* ITEMS */}
        <div>

          <h3 style={{ marginBottom: "15px" }}>
            Medicines
          </h3>

          {items.map((item, index) => {

            const selectedMed = medicines.find(
              (m) => String(m.id) === String(item.medicine_id)
            );

            return (
              <div
                key={index}
                style={{
                  background: "#f9fafb",
                  padding: "15px",
                  borderRadius: "14px",
                  marginBottom: "15px",
                  border: "1px solid #e5e7eb"
                }}
              >

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr auto",
                    gap: "12px",
                    alignItems: "center"
                  }}
                >

                  {/* MEDICINE */}
                  <select
                    value={item.medicine_id}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "medicine_id",
                        e.target.value
                      )
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db"
                    }}
                  >
                    <option value="">
                      Select Medicine
                    </option>

                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} | Stock: {m.stock_quantity}
                      </option>
                    ))}
                  </select>

                  {/* QUANTITY */}
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db"
                    }}
                  />

                  {/* REMOVE */}
                  <button
                    onClick={() => removeItem(index)}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Remove
                  </button>

                </div>

                {/* MED INFO */}
                {selectedMed && (
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      gap: "20px",
                      fontSize: "14px",
                      color: "#4b5563"
                    }}
                  >
                    <div>
                      💰 Price:
                      <b>
                        {" "}KES {selectedMed.selling_price}
                      </b>
                    </div>

                    <div>
                      📦 Stock:
                      <b>
                        {" "}{selectedMed.stock_quantity}
                      </b>
                    </div>

                    <div>
                      🧮 Subtotal:
                      <b>
                        {" "}
                        KES {
                          Number(selectedMed.selling_price) *
                          Number(item.quantity)
                        }
                      </b>
                    </div>
                  </div>
                )}

              </div>
            );
          })}

          {/* ADD BUTTON */}
          <button
            onClick={addItemRow}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            + Add Medicine
          </button>

        </div>

        {/* PAYMENT */}
        <div
          style={{
            marginTop: "25px"
          }}
        >

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600"
            }}
          >
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{
              width: "250px",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db"
            }}
          >
            <option value="cash">Cash</option>
            <option value="mpesa">Mpesa</option>
            <option value="card">Card</option>
          </select>

        </div>
        {message && (
          <div
            style={{
              background:
                messageType === "error"
                  ? "#fee2e2"
                  : "#dcfce7",
              color:
                messageType === "error"
                  ? "#b91c1c"
                  : "#166534",
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          >
            {message}
          </div>
        )}

        {/* TOTAL */}
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            background: "#eff6ff",
            borderRadius: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >

          <div>
            <div
              style={{
                color: "#6b7280",
                marginBottom: "5px"
              }}
            >
              Total Amount
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1d4ed8"
              }}
            >
              KES {calculateTotal()}
            </div>
          </div>

          <button
            onClick={handleCreateSale}
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#16a34a",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {loading
              ? "Processing..."
              : "Complete Sale"}
          </button>

        </div>

      </div>

      {/* SALES HISTORY */}
      <div
        style={{
          background: "white",
          borderRadius: "18px",
          padding: "25px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
        }}
      >

        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px"
          }}
        >
          📜 Sales History
        </h2>

        {sales.length === 0 ? (
          <p>No sales yet</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >

            {sales.map((sale) => (
              <div
                key={sale.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr 1fr 1fr",
                  gap: "10px",
                  padding: "15px",
                  borderRadius: "12px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  alignItems: "center"
                }}
              >

                <div>
                  <b>Sale #{sale.id}</b>
                </div>

                <div>
                  Patient ID: {sale.patient_id}
                </div>

                <div
                  style={{
                    fontWeight: "bold",
                    color: "#16a34a"
                  }}
                >
                  KES {sale.total_amount}
                </div>

                <div
                  style={{
                    textTransform: "capitalize"
                  }}
                >
                  {sale.payment_method}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Sales;