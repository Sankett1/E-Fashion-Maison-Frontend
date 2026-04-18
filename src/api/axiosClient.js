import axios from "axios";

// ── Base axios instance ───────────────────────────────────────────────────────
// VITE_API_URL should be e.g. http://localhost:5000/api  (include /api)
const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout:         20000,
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

    // 401 — only clear session if we're NOT already on a public page to avoid loop
    if (status === 401) {
      const publicPaths = ["/", "/shop", "/about", "/contact"];
      const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p));
      localStorage.removeItem("maison_token");
      localStorage.removeItem("maison_user");
      if (!isPublic && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    if (status === 429) {
      error.friendlyMessage = "Too many requests. Please wait a moment and try again.";
    }

    if (!error.response) {
      error.friendlyMessage = "Unable to reach the server. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
