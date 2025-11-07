import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT token if present
API.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);
    console.log("Request data:", config.data);

    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    console.error("Error response:", error.response);
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const googleLogin = (data) => API.post("/auth/google", data);

// Admin - Fetchers
export const getUsers = () => API.get("/users");
export const deleteUser = (id) => API.delete(`/users/${id}`);

export const getVehicles = () => API.get("/vehicles");
export const getMyVehicles = () => API.get("/vehicles/my-vehicles");
export const getServices = () => API.get("/services");
export const getAppointments = () => API.get("/appointments");
export const getMyAppointments = () => API.get("/appointments/my");
export const getMyAssignedAppointments = () => API.get("/appointments/my-assignments");
export const getTimeLogs = () => API.get("/time-logs");
export const getDashboardMetrics = () => API.get("/dashboard/metrics");
export const getDashboardStats = () => API.get("/dashboard/stats");

// Service Requests API
// Customer endpoints
export const requestService = (data) => API.post("/services/request", data);
export const getMyServices = (params) =>
  API.get("/services/my-services", { params });
export const getMyService = (id) => API.get(`/services/${id}`);
export const cancelMyService = (id) => API.patch(`/services/${id}/cancel`);

// Employee endpoints
export const getAssignedServices = (params) =>
  API.get("/services/assigned", { params });
export const getAvailableServices = () => API.get("/services/available");
export const claimService = (id) => API.post(`/services/${id}/claim`);
export const updateServiceProgress = (id, data) =>
  API.patch(`/services/${id}/progress`, data);

// Admin endpoints
export const getAllServices = () => API.get("/services");
export const getService = (id) => API.get(`/services/${id}`);
export const approveService = (id, data) =>
  API.patch(`/services/${id}/approve`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);

// Project/Modification Requests API
// Customer endpoints
export const requestProject = (data) => API.post("/projects/request", data);
export const getMyProjects = (params) =>
  API.get("/projects/my-projects", { params });
export const getMyProject = (id) => API.get(`/projects/${id}`);
export const cancelMyProject = (id) => API.patch(`/projects/${id}/cancel`);

// Employee endpoints
export const getAssignedProjects = (params) =>
  API.get("/projects/assigned", { params });
export const getAvailableProjects = () => API.get("/projects/available");
export const claimProject = (id) => API.post(`/projects/${id}/claim`);
export const updateProjectProgress = (id, data) =>
  API.patch(`/projects/${id}/progress`, data);
export const addMilestone = (id, data) =>
  API.post(`/projects/${id}/milestones`, data);
export const completeMilestone = (id, milestoneId) =>
  API.patch(`/projects/${id}/milestones/${milestoneId}/complete`);

// Admin endpoints
export const getAllProjects = () => API.get("/projects");
export const getProject = (id) => API.get(`/projects/${id}`);
export const approveProject = (id, data) =>
  API.patch(`/projects/${id}/approve`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const getAllBookings = () => API.get("/bookings");
export const getMyAssignedBookings = () => API.get("/bookings/my-assigned");
export const getCustomers = () => API.get("/customers");
export const getStaff = () => API.get("/staff");

export const createVehicle = (payload) => {
  return API.post(`/vehicles`, payload);
};

export const getVehicleByNumber = (vehicleNumber) => {
  return API.get("/vehicles/lookup", {
    params: { plateNumber: vehicleNumber },
  });
};

// Profile
export const getProfile = () => API.get("/profile");
export const updateProfile = (data) => API.put("/profile", data);

// Add vehicles by owner
export const getVehiclesByOwner = (userId) => {
  return API.get(`/vehicles/owner/${userId}`);
};

export const uploadProfileImage = (formData) =>
  API.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Export the API instance as default for inventory management
export default API;
