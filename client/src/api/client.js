import axios from "axios";

// In dev, Vite proxies /api → localhost:5000 (vite.config.js).
// In production (Vercel), VITE_API_URL must be set to the Render backend URL
// e.g. https://raiffeisen-youth-api.onrender.com
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ry_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
