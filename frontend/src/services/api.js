import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: false,
});

// add Authorization header automatically if token stored
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  return config;
}, err => Promise.reject(err));

// Auth endpoints
export const login = (data) => api.post("/auth/login", data);
export const signup = (data) => api.post("/auth/signup", data);
export const googleLogin = (data) => api.post("/auth/google", data);

// Appointments and bookings
export const getAppointments = (params) => api.get("/appointments", { params });
export const getAllBookings = (params) => api.get("/bookings", { params });

// Services
export const getServices = (params) => api.get("/services", { params });

// Vehicles
export const getMyVehicles = () => api.get("/vehicles/my-vehicles");
export const getVehicles = (params) => api.get("/vehicles", { params });

// Users and staff management
export const getCustomers = (params) => api.get("/customers", { params });
export const getUsers = (params) => api.get("/users", { params });
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getStaff = (params) => api.get("/employees", { params });

// Dashboard and logs
export const getDashboardStats = () => api.get("/dashboard/stats");
export const getTimeLogs = (params) => api.get("/time-logs", { params });

// Modifications
export const getModifications = () => api.get("/modifications");
export const createModification = (formData) =>
  api.post("/modifications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updateModification = (id, data) => api.put(`/modifications/${id}`, data);
export const deleteModification = (id) => api.delete(`/modifications/${id}`);

export default api;
