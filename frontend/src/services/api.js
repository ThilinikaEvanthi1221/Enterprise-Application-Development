import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Attach JWT token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const googleLogin = (data) => API.post("/auth/google", data);

// Admin - Fetchers
export const getUsers = () => API.get("/users");
export const deleteUser = (id) => API.delete(`/users/${id}`);

export const getVehicles = () => API.get("/vehicles");
export const getServices = () => API.get("/services");
export const getAppointments = () => API.get("/appointments");
export const getTimeLogs = () => API.get("/time-logs");
export const getDashboardMetrics = () => API.get("/dashboard/metrics");
export const getDashboardStats = () => API.get("/dashboard/stats");
export const getAllBookings = () => API.get("/bookings");
export const getCustomers = () => API.get("/customers");
export const getStaff = () => API.get("/staff");

export const createVehicle = (payload) => {
  return API.post(`/vehicles`, payload);
};

export const getVehicleByNumber = (plateNumber) => {
  return API.get(`/vehicles/lookup`, {
    params: { plateNumber }, // sends as /vehicles/lookup?plateNumber=ABC123
  });
};
