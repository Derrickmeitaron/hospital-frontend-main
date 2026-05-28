import React, { useEffect, useState } from "react";
import { getStockMovements } from "../api";

function StockMovement() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getStockMovements();

            const sorted = (res?.data || []).sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });

            setMovements(sorted);
        } catch (err) {
            console.error("Stock movement load error:", err);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FORMAT HELPERS (NOW USED)
    // =========================
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString("en-KE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatQuantity = (qty, type) => {
        const num = Number(qty);
        return type === "restock" ? `+${num}` : `${num}`;
    };

    const getTypeStyle = (type) => {
        return type === "restock"
            ? {
                color: "#16a34a",
                background: "#dcfce7",
                border: "1px solid #86efac"
            }
            : {
                color: "#dc2626",
                background: "#fee2e2",
                border: "1px solid #fca5a5"
            };
    };

    return (
        <div style={{ padding: "20px" }}>

            <h2 style={{ marginBottom: "15px" }}>
                📦 Stock Movement Timeline
            </h2>

            {loading ? (
                <p>Loading movements...</p>
            ) : movements.length === 0 ? (
                <p>No stock movements found</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {movements.map((m, index) => {
                        const isLatest = index === 0;

                        return (
                            <div
                                key={m.id}
                                style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    border: isLatest
                                        ? "2px solid #3b82f6"
                                        : "1px solid #e5e7eb",
                                    background: "#fff",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >

                                {/* LEFT SIDE */}
                                <div>
                                    <div style={{ fontWeight: "600" }}>
                                        {m.movement_type === "restock" ? "🟢 RESTOCK" : "🔴 SALE"}{" "}
                                        <span style={getTypeStyle(m.movement_type)}>
                                            {formatQuantity(m.quantity, m.movement_type)}
                                        </span>{" "}
                                        {m.medicine_name}
                                    </div>

                                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                        {formatDate(m.created_at)}
                                    </div>
                                </div>

                                {/* RIGHT SIDE */}
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                    Ref #{m.reference_id || "-"}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default StockMovement;