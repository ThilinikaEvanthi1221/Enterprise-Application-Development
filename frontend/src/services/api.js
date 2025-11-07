import axios from "axios";

// Create reusable axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------ AUTH APIs ------------------
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);

// ------------------ ADMIN APIs ------------------
export const getHealthStatus = () => API.get("/health");

// ------------------ EMAIL UTILITIES ------------------
// Email utility functions can be added here for admin email management

export default API;
