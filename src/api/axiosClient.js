import axios from "axios";

// ── Base axios instance ───────────────────────────────────────────────────────
const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout:         15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach JWT from localStorage ────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("maison_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle errors globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid — clear session and redirect to home
      localStorage.removeItem("maison_token");
      localStorage.removeItem("maison_user");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    if (status === 429) {
      // Rate limited — attach friendly message for UI to surface
      error.friendlyMessage = "Too many requests. Please wait a moment and try again.";
    }

    if (!error.response) {
      // Network error / server down
      error.friendlyMessage = "Unable to reach the server. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
