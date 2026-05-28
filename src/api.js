import axios from "axios";

// =========================
// BASE CONFIG
// =========================
const api = axios.create({
  baseURL: "https://derrick.alwaysdata.net",
  headers: {
    "Content-Type": "application/json"
  }
});

// =========================
// AUTH INTERCEPTOR
// =========================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================
// HELPERS
// =========================
const getData = (res) => res?.data?.data;

// =========================
// PATIENT APIS
// =========================
export const getPatients = async () => {
  const res = await api.get("/patients");
  return { data: getData(res) || [] };
};

export const getPatient = async (id) => {
  const res = await api.get(`/patient/${id}`);
  return { data: getData(res) || {} };
};

export const searchPatients = async (query) => {
  const res = await api.get(
    `/patients/search?q=${encodeURIComponent(query)}`
  );

  return { data: getData(res) || [] };
};

// =========================
// MEDICAL RECORDS
// =========================
export const getRecords = async (patientId) => {
  const res = await api.get(`/records/${patientId}`);
  return { data: getData(res) || [] };
};

export const addRecord = async (data) => {
  const res = await api.post("/add_record", data);
  return { data: res?.data || {} };
};

// =========================
// PHARMACY MODULE
// =========================
export const getPharmacyQueue = async () => {
  const res = await api.get("/pharmacy/queue");
  return { data: getData(res) || [] };
};

export const getPharmacyRecords = async (patientId) => {
  const res = await api.get(`/pharmacy/records/${patientId}`);
  return { data: getData(res) || [] };
};

export const getPharmacyRecordsByNID = async (nid) => {
  const res = await api.get(
    `/pharmacy/records/nid/${encodeURIComponent(nid)}`
  );

  return { data: res?.data || {} };
};

export const dispenseMedication = async (recordId) => {
  const res = await api.put(`/pharmacy/dispense/${recordId}`);
  return { data: res?.data || {} };
};

// =========================
// ADMIN USERS
// =========================
export const getUsers = async () => {
  const res = await api.get("/admin/users");
  return { data: getData(res) || [] };
};

export const createUser = async (data) => {
  const res = await api.post("/admin/users", data);
  return { data: res?.data || {} };
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return { data: res?.data || {} };
};

export const getAdminPatient = async (id) => {
  const res = await api.get(`/admin/patient/${id}`);
  return { data: res?.data || {} };
};

// =========================
// AUTH
// =========================
export const loginUser = async (data) => {
  const res = await api.post("/login", data);
  return { data: res?.data || {} };
};

// =========================
// DASHBOARD
// =========================
export const getDashboardSummary = async () => {
  const res = await api.get("/reports/dashboard");
  return { data: getData(res) || {} };
};

export const getTotalSalesReport = async () => {
  const res = await api.get("/reports/total-sales");
  return { data: getData(res) || {} };
};

export const getTodaySalesReport = async () => {
  const res = await api.get("/reports/today-sales");
  return { data: getData(res) || {} };
};

export const getTopMedicines = async () => {
  const res = await api.get("/reports/top-medicines");
  return { data: getData(res) || [] };
};

export const getLowStockReport = async () => {
  const res = await api.get("/reports/low-stock");
  return { data: getData(res) || [] };
};

// =========================
// SALES GRAPHS
// =========================
export const getWeeklySales = async () => {
  const res = await api.get("/reports/sales-weekly");

  return {
    data: res?.data?.data || []
  };
};

export const getMonthlySales = async () => {

  const res = await api.get("/reports/sales-monthly");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  const raw = res?.data?.data || [];

  return {
    data: raw.map((item) => ({
      month: monthNames[item.month - 1] || item.month,
      total_sales: Number(item.total_sales || 0)
    }))
  };
};

// =========================
// MEDICINES
// =========================
export const getMedicines = async () => {
  const res = await api.get("/medicines");
  return res.data;
};

export const addMedicine = async (data) => {
  const res = await api.post("/medicines", data);
  return { data: res?.data || {} };
};

export const updateMedicine = async (id, data) => {
  const res = await api.put(`/medicines/${id}`, data);
  return { data: res?.data || {} };
};

export const deleteMedicine = async (id) => {
  const res = await api.delete(`/medicines/${id}`);
  return { data: res?.data || {} };
};

export const searchMedicines = async (name) => {
  const res = await api.get(
    `/medicines/search?name=${encodeURIComponent(name)}`
  );

  return { data: getData(res) || [] };
};

export const getLowStockMedicines = async () => {
  const res = await api.get("/medicines/low-stock");
  return { data: getData(res) || [] };
};

export const getExpiringMedicines = async () => {
  const res = await api.get("/medicines/expiring");
  return { data: getData(res) || [] };
};

export const getStockMovements = async () => {
  const res = await api.get("/stock-movements");
  return { data: getData(res) || [] };
};

// =========================
// SALES
// =========================
export const createSale = async (data) => {
  const res = await api.post("/sales", data);
  return { data: res?.data || {} };
};

export const getSales = async () => {
  const res = await api.get("/sales");
  return { data: getData(res) || [] };
};

export const getSingleSale = async (id) => {
  const res = await api.get(`/sales/${id}`);
  return { data: getData(res) || {} };
};

// =========================
// CATEGORIES
// =========================
export const getCategories = async () => {
  const res = await api.get("/categories");
  return { data: res.data };
};

export const addCategory = async (data) => {
  const res = await api.post("/categories", data);
  return { data: res?.data || {} };
};

// =========================
// UNITS
// =========================
export const getUnits = async () => {
  const res = await api.get("/units");
  return { data: res.data };
};

export const addUnit = async (data) => {
  const res = await api.post("/units", data);
  return { data: res?.data || {} };
};

export const restockMedicine = async (data) => {
    const res = await api.post("/medicines/restock", data);
    return res.data;
};

// =========================
// GET PENDING PRESCRIPTIONS
// =========================
export const getPendingPrescriptions = async () => {
    const res = await api.get("/pharmacy/queue");

    return {
        data: res?.data?.data || []
    };
};

// =========================
// GET PRESCRIPTION DETAILS
// =========================
export const getPrescriptionDetails = async (id) => {
    return api.get(`/prescriptions/${id}`);
};

// =========================
// DISPENSE PRESCRIPTION
// =========================
export const dispensePrescription = async (id) => {
    return api.post(`/pharmacy/dispense/${id}`);
};

// =========================
// EXPORT
// =========================
export default api;