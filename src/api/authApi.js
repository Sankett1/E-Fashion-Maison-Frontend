import api from "./axiosClient.js";

// ── Register ──────────────────────────────────────────────────────────────────
export const register = async ({ name, email, password }) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  if (data.token) {
    localStorage.setItem("maison_token", data.token);
    localStorage.setItem("maison_user",  JSON.stringify(data.user));
  }
  return data;
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  if (data.token) {
    localStorage.setItem("maison_token", data.token);
    localStorage.setItem("maison_user",  JSON.stringify(data.user));
  }
  return data;
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("maison_token");
  localStorage.removeItem("maison_user");
};

// ── Get current user ──────────────────────────────────────────────────────────
export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

// ── Update profile ────────────────────────────────────────────────────────────
export const updateProfile = async (payload) => {
  const { data } = await api.put("/auth/update-profile", payload);
  return data;
};

// ── Change password ───────────────────────────────────────────────────────────
export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put("/auth/change-password", { currentPassword, newPassword });
  return data;
};

// ── Upload avatar ─────────────────────────────────────────────────────────────
export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await api.put("/auth/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// ── Addresses ─────────────────────────────────────────────────────────────────
export const addAddress = async (address) => {
  const { data } = await api.post("/auth/address", address);
  return data;
};
export const removeAddress = async (id) => {
  const { data } = await api.delete(`/auth/address/${id}`);
  return data;
};

// ── Helper: get stored user ───────────────────────────────────────────────────
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("maison_user"));
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!localStorage.getItem("maison_token");
