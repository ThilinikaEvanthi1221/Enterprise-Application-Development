import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
