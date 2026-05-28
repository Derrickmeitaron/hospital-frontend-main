import React, { useEffect, useState } from "react";

import {
    getDashboardSummary,
    getTopMedicines,
    getTotalSalesReport,
    getTodaySalesReport,
    getWeeklySales,
    getMonthlySales
} from "../api";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LineChart,
    Line
} from "recharts";
import {
    getLowStockMedicines,
    getExpiringMedicines
} from "../api";

function Dashboard() {

    const [stats, setStats] = useState({
        medicines: 0,
        patients: 0,
        total_sales: 0,
        today_sales: 0,
        low_stock: 0,
        expiring_medicines: 0
    });

    const [salesSummary, setSalesSummary] = useState({
        total_sales: 0,
        total_transactions: 0
    });

    const [todaySummary, setTodaySummary] = useState({
        total_sales: 0,
        total_transactions: 0
    });

    const [topMedicines, setTopMedicines] = useState([]);

    const [loading, setLoading] = useState(true);

    const [weeklySales, setWeeklySales] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [lowStockList, setLowStockList] = useState([]);
    const [expiringList, setExpiringList] = useState([]);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                // DASHBOARD
                const dashboardRes = await getDashboardSummary();

                console.log("DASHBOARD:", dashboardRes);

                setStats(dashboardRes.data);

                // TOTAL SALES
                const totalSalesRes = await getTotalSalesReport();

                console.log("TOTAL SALES:", totalSalesRes);

                setSalesSummary(totalSalesRes.data);

                // TODAY SALES
                const todaySalesRes = await getTodaySalesReport();

                console.log("TODAY SALES:", todaySalesRes);

                setTodaySummary(todaySalesRes.data);

                // TOP MEDICINES
                const topRes = await getTopMedicines();

                console.log("TOP MEDICINES:", topRes);

                setTopMedicines(topRes.data);

                // WEEKLY SALES
                const weeklyRes = await getWeeklySales();
                setWeeklySales(weeklyRes?.data || []);

                // MONTHLY SALES
                const monthlyRes = await getMonthlySales();
                setMonthlySales(monthlyRes?.data || []);

                const lowStockRes = await getLowStockMedicines();
                setLowStockList(lowStockRes?.data || []);
                const expiringRes = await getExpiringMedicines();
                setExpiringList(expiringRes?.data || []);

            } catch (err) {

                console.error("Dashboard error:", err);

            } finally {

                setLoading(false);

            }
        };

        loadDashboard();

    }, []);

    const getDaysRemaining = (expiryDate) => {

        const today = new Date();

        const expiry = new Date(expiryDate);

        const diffTime = expiry - today;

        return Math.ceil(
            diffTime / (1000 * 60 * 60 * 24)
        );
    };

    if (loading) {
        return (
            <div style={{ padding: 20 }}>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>

            <h2>📊 Admin Dashboard</h2>

            {/* SUMMARY CARDS */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginTop: "20px"
                }}
            >

                <div className="card">
                    <h3>💊 Medicines</h3>
                    <h1>{stats?.medicines || 0}</h1>
                </div>

                <div className="card">
                    <h3>🧑 Patients</h3>
                    <h1>{stats?.patients || 0}</h1>
                </div>

                <div className="card">
                    <h3>🧾 Transactions</h3>
                    <h1>{salesSummary?.total_transactions || 0}</h1>
                </div>

                <div className="card">
                    <h3>💰 Total Revenue</h3>
                    <h1>
                        KES {salesSummary?.total_sales || 0}
                    </h1>
                </div>

                <div className="card">
                    <h3>📅 Today Revenue</h3>
                    <h1>
                        KES {todaySummary?.total_sales || 0}
                    </h1>
                </div>

                <div className="card">
                    <h3>⚠️ Low Stock</h3>
                    <h1>{stats?.low_stock || 0}</h1>
                </div>

                <div className="card">
                    <h3>⏳ Expiring Medicines</h3>
                    <h1>{stats?.expiring_medicines || 0}</h1>
                </div>

            </div>
            <div className="card" style={{ marginTop: "30px", padding: "20px" }}>
                <h3>⚠️ Low Stock Medicines</h3>

                {lowStockList.length === 0 ? (
                    <p>All medicines are well stocked</p>
                ) : (
                    lowStockList.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "10px 0",
                                borderBottom: "1px solid #ddd"
                            }}
                        >
                            <div>
                                <b>{m.name}</b>
                            </div>

                            <div>
                                Stock: {m.stock_quantity}
                            </div>

                            <div>
                                Min: {m.minimum_stock}
                            </div>

                            <div>
                                {m.unit}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div
                className="card"
                style={{
                    marginTop: "30px",
                    padding: "20px"
                }}
            >

                <h3>⏳ Expiring Medicines</h3>

                {expiringList.length === 0 ? (

                    <p>No medicines expiring soon</p>

                ) : (

                    expiringList.map((m) => {

                        const daysRemaining =
                            getDaysRemaining(m.expiry_date);

                        const expired =
                            daysRemaining < 0;

                        return (

                            <div
                                key={m.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 0",
                                    borderBottom: "1px solid #ddd"
                                }}
                            >

                                <div>
                                    <b>{m.name}</b>
                                </div>

                                <div>
                                    Expiry: {m.expiry_date}
                                </div>

                                <div>
                                    Stock: {m.stock_quantity}
                                </div>

                                <div
                                    style={{
                                        fontWeight: "bold",
                                        color: expired
                                            ? "#dc2626"
                                            : daysRemaining <= 7
                                                ? "#ea580c"
                                                : "#ca8a04"
                                    }}
                                >
                                    {expired
                                        ? "Expired"
                                        : `${daysRemaining} days left`}
                                </div>

                            </div>
                        );
                    })

                )}

            </div>

            {/* TOP MEDICINES */}

            <div
                className="card"
                style={{ marginTop: "30px", padding: "20px" }}
            >

                <h3>🔥 Top Selling Medicines</h3>

                {topMedicines.length === 0 ? (

                    <p>No sales data available</p>

                ) : (

                    topMedicines.map((m) => (

                        <div
                            key={m.id}
                            className="admin-user-row"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "10px 0",
                                borderBottom: "1px solid #ddd"
                            }}
                        >

                            <div>
                                <b>{m.name}</b>
                            </div>

                            <div>
                                Sold: {m.total_quantity_sold}
                            </div>

                            <div>
                                Revenue: KES {m.total_sales}
                            </div>

                            <div>
                                {m.unit}
                            </div>

                        </div>

                    ))


                )}

            </div>

            <div className="card" style={{ marginTop: "30px", padding: "20px" }}>
                <h3>📈 Weekly Sales</h3>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />

                        <Bar
                            dataKey="total_sales"
                            fill="#4f46e5"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card" style={{ marginTop: "30px", padding: "20px" }}>
                <h3>📊 Monthly Sales</h3>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="total_sales"
                            stroke="#16a34a"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}

export default Dashboard;