import React, { useEffect, useState } from "react";
import {
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    getCategories,
    addCategory,
    getUnits,
    addUnit,
    restockMedicine
} from "../api";

function Medicines() {

    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);

    const [newCategory, setNewCategory] = useState("");
    const [newUnit, setNewUnit] = useState("");
    const [search, setSearch] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [restockItem, setRestockItem] = useState(null);
    const [restockQty, setRestockQty] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [form, setForm] = useState({
        name: "",
        category_id: "",
        unit: "",
        stock_quantity: "",
        buying_price: "",
        selling_price: "",
        expiry_date: ""
    });

    const labelStyle = {
        fontSize: "12px",
        fontWeight: "600",
        color: "#555",
        marginBottom: "4px",
        display: "block"
    };

    // =========================
    // LOAD DATA
    // =========================
    const loadMedicines = async () => {
        const res = await getMedicines();
        setMedicines(res?.data || []);
    };

    const loadCategories = async () => {
        const res = await getCategories();
        setCategories(res?.data || []);
    };

    const loadUnits = async () => {
        const res = await getUnits();
        setUnits(res?.data || []);
    };

    useEffect(() => {
        loadMedicines();
        loadCategories();
        loadUnits();
    }, []);

    // =========================
    // SAVE
    // =========================
    const handleSave = async () => {
        if (!form.name || !form.unit) {
            setErrorMessage("Name and unit required");

            setTimeout(() => {
                setErrorMessage("");
            }, 3000);

            return;

        }

        if (editingId) {
            await updateMedicine(editingId, form);
        } else {
            await addMedicine(form);
        }

        setForm({
            name: "",
            category_id: "",
            unit: "",
            stock_quantity: "",
            buying_price: "",
            selling_price: "",
            expiry_date: ""
        });

        setEditingId(null);
        setSuccessMessage(
            editingId
                ? "Medicine updated successfully"
                : "Medicine added successfully"
        );

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
        loadMedicines();
    };

    // =========================
    // CATEGORY / UNIT
    // =========================
    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        await addCategory({ name: newCategory });
        setNewCategory("");
        setSuccessMessage("Category added successfully");

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        loadCategories();
    };

    const handleAddUnit = async () => {
        if (!newUnit.trim()) return;
        await addUnit({ name: newUnit });
        setNewUnit("");
        setSuccessMessage("Unit added successfully");

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
        loadUnits();
    };

    // =========================
    // EDIT / DELETE
    // =========================
    const handleEdit = (m) => {
        setEditingId(m.id);
        setForm({
            name: m.name || "",
            category_id: m.category_id || "",
            unit: m.unit || "",
            stock_quantity: m.stock_quantity || "",
            buying_price: m.buying_price || "",
            selling_price: m.selling_price || "",
            expiry_date: m.expiry_date ? m.expiry_date.split("T")[0] : ""
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete medicine?")) return;
        await deleteMedicine(id);
        setSuccessMessage("Medicine deleted successfully");

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
        loadMedicines();
    };

    // =========================
    // SEARCH
    // =========================
    const handleSearch = async (value) => {
        setSearch(value);

        if (!value.trim()) {
            setSuggestions([]);
            loadMedicines();
            return;
        }

        const res = await searchMedicines(value);
        const results = res?.data || [];

        setMedicines(results);
        setSuggestions(results.slice(0, 5)); // top 5 suggestions
        setShowSuggestions(true);
    };

    const handleSearchClick = async () => {
        if (!search.trim()) return;

        const res = await searchMedicines(search);
        setMedicines(res?.data || []);
        setShowSuggestions(false);
    };

    // =========================
    // UI STYLE OBJECTS
    // =========================
    const cardStyle = {
        background: "#fff",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: "15px"
    };

    const grid = {
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: "15px",
        alignItems: "start"
    };

    const btn = {
        padding: "8px 12px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer"
    };

    const primaryBtn = { ...btn, background: "#2563eb", color: "#fff" };
    const dangerBtn = { ...btn, background: "#ef4444", color: "#fff" };

    // =========================
    // RENDER
    // =========================
    return (
        <div style={{ padding: "20px", background: "#f5f7fb", minHeight: "100vh" }}>

            <h2 style={{ marginBottom: "15px" }}>💊 Medicines Management</h2>
            {/* SUCCESS MESSAGE */}
            {successMessage && (
                <div
                    style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "12px",
                        borderRadius: "10px",
                        marginBottom: "15px",
                        border: "1px solid #86efac"
                    }}
                >
                    {successMessage}
                </div>
            )}

            {/* ERROR MESSAGE */}
            {errorMessage && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: "12px",
                        borderRadius: "10px",
                        marginBottom: "15px",
                        border: "1px solid #fca5a5"
                    }}
                >
                    {errorMessage}
                </div>
            )}

            <div style={grid}>

                {/* LEFT SIDE */}
                <div>

                    {/* CATEGORIES */}
                    <div style={cardStyle}>
                        <h3>Categories</h3>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Add category"
                            />
                            <button style={primaryBtn} onClick={handleAddCategory}>Add</button>
                        </div>

                        <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {categories.map(c => (
                                <span key={c.id} style={{
                                    padding: "6px 10px",
                                    background: "#eef2ff",
                                    borderRadius: "8px",
                                    fontSize: "12px"
                                }}>
                                    {c.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* UNITS */}
                    <div style={cardStyle}>
                        <h3>Units</h3>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                value={newUnit}
                                onChange={(e) => setNewUnit(e.target.value)}
                                placeholder="Add unit"
                            />
                            <button style={primaryBtn} onClick={handleAddUnit}>Add</button>
                        </div>

                        <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {units.map(u => (
                                <span key={u.id} style={{
                                    padding: "6px 10px",
                                    background: "#ecfeff",
                                    borderRadius: "8px",
                                    fontSize: "12px"
                                }}>
                                    {u.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* FORM */}
                    <div style={cardStyle}>
                        <h3 style={{ marginBottom: "12px" }}>
                            {editingId ? "Update Medicine" : "Add Medicine"}
                        </h3>

                        {/* GRID FORM */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px"
                            }}
                        >

                            {/* NAME (FULL WIDTH) */}
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>Medicine Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Paracetamol"
                                />
                            </div>

                            {/* CATEGORY */}
                            <div>
                                <label style={labelStyle}>Category</label>
                                <select
                                    value={form.category_id}
                                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                >
                                    <option value="">Select category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* UNIT */}
                            <div>
                                <label style={labelStyle}>Unit</label>
                                <select
                                    value={form.unit}
                                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                >
                                    <option value="">Select unit</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.name}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="number"
                                placeholder="Stock Quantity"
                                value={form.stock_quantity}
                                onChange={(e) =>
                                    setForm({ ...form, stock_quantity: e.target.value })
                                }
                            />



                            {/* BUYING PRICE */}
                            <div>
                                <label style={labelStyle}>Buying Price</label>
                                <input
                                    type="number"
                                    value={form.buying_price}
                                    onChange={(e) =>
                                        setForm({ ...form, buying_price: e.target.value })
                                    }
                                    placeholder="0"
                                />
                            </div>

                            {/* SELLING PRICE */}
                            <div>
                                <label style={labelStyle}>Selling Price</label>
                                <input
                                    type="number"
                                    value={form.selling_price}
                                    onChange={(e) =>
                                        setForm({ ...form, selling_price: e.target.value })
                                    }
                                    placeholder="0"
                                />
                            </div>

                            {/* EXPIRY */}
                            <div>
                                <label style={labelStyle}>Expiry Date</label>
                                <input
                                    type="date"
                                    value={form.expiry_date}
                                    onChange={(e) =>
                                        setForm({ ...form, expiry_date: e.target.value })
                                    }
                                />
                            </div>

                        </div>

                        {/* BUTTON */}
                        <div style={{ marginTop: "14px" }}>
                            <button
                                style={{
                                    ...primaryBtn,
                                    width: "100%",
                                    padding: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}
                                onClick={handleSave}
                            >
                                {editingId ? "Update Medicine" : "Save Medicine"}
                            </button>
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div>

                    {/* SEARCH */}
                    <div style={cardStyle}>
                        <h3>Search Medicines</h3>

                        <div style={{ position: "relative" }}>

                            {/* INPUT + BUTTON */}
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                    value={search}
                                    placeholder="Search medicine..."
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                />

                                <button
                                    style={primaryBtn}
                                    onClick={handleSearchClick}
                                >
                                    Search
                                </button>
                            </div>

                            {/* DROPDOWN SUGGESTIONS */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div style={{
                                    position: "absolute",
                                    top: "45px",
                                    left: 0,
                                    right: 0,
                                    background: "#fff",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                    zIndex: 10,
                                    maxHeight: "200px",
                                    overflowY: "auto"
                                }}>

                                    {suggestions.map((item) => (
                                        <div
                                            key={item.id}
                                            onMouseDown={() => {
                                                setSearch(item.name);
                                                setMedicines([item]);
                                                setShowSuggestions(false);
                                            }}
                                            style={{
                                                padding: "10px",
                                                cursor: "pointer",
                                                borderBottom: "1px solid #f1f1f1"
                                            }}
                                        >
                                            <b>{item.name}</b>
                                            <div style={{ fontSize: "12px", color: "#666" }}>
                                                Stock: {item.stock_quantity}
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            )}

                        </div>
                    </div>

                    {/* LIST */}
                    <div style={cardStyle}>
                        <h3>Medicines</h3>

                        {medicines.length === 0 ? (
                            <p>No medicines found</p>
                        ) : (
                            medicines.map(m => (
                                <div key={m.id} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "10px",
                                    borderBottom: "1px solid #eee"
                                }}>
                                    <div>
                                        <b>{m.name}</b>
                                        <div style={{ fontSize: "12px", color: "#666" }}>
                                            Stock: {m.stock_quantity} | {m.unit}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button style={primaryBtn} onClick={() => handleEdit(m)}>Edit</button>
                                        <button style={dangerBtn} onClick={() => handleDelete(m.id)}>Delete</button>
                                        <button onClick={() => setRestockItem(m)}>
                                            Restock
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
            {restockItem && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <div style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        width: "300px"
                    }}>
                        <h3>Restock {restockItem.name}</h3>

                        <input
                            type="number"
                            placeholder="Quantity"
                            value={restockQty}
                            onChange={(e) => setRestockQty(e.target.value)}
                        />

                        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                            <button
                                onClick={async () => {
                                    try {

                                        await restockMedicine({
                                            medicine_id: restockItem.id,
                                            quantity: Number(restockQty)
                                        });

                                        setSuccessMessage("Medicine restocked successfully");

                                        setTimeout(() => {
                                            setSuccessMessage("");
                                        }, 3000);

                                        setRestockItem(null);
                                        setRestockQty("");

                                        loadMedicines();

                                    } catch (err) {

                                        setErrorMessage("Failed to restock medicine");

                                        setTimeout(() => {
                                            setErrorMessage("");
                                        }, 3000);
                                    }
                                }}
                            >
                                Confirm
                            </button>

                            <button onClick={() => setRestockItem(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );

}


export default Medicines;