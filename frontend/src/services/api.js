import axios from "axios";

// Create reusable axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ------------------ AUTH APIs ------------------
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);

// ------------------ APPOINTMENT APIs ------------------
export const getAvailableSlots = (date) => 
  API.get(`/appointments/available?date=${date}`);

export const bookAppointment = (data) => 
  API.post("/appointments", data);

export default API;
