import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("maison_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("maison_token"));
  // FIX: initialising to true so AdminGuard waits for hydration before redirecting
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    // If we already have user data from localStorage, we're immediately hydrated
    if (!token || user) {
      setHydrated(true);
      return;
    }
    // Token exists but user data is missing — fetch from server
    getMe()
      .then(d => {
        setUser(d.user);
        localStorage.setItem("maison_user", JSON.stringify(d.user));
      })
      .catch(() => {
        localStorage.removeItem("maison_token");
        localStorage.removeItem("maison_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setHydrated(true));
  }, []);

  const login = async (creds) => {
    setLoading(true);
    try {
      const data = await apiLogin(creds);
      setUser(data.user); setToken(data.token);
      return data;
    } finally { setLoading(false); }
  };

  const register = async (creds) => {
    setLoading(true);
    try {
      const data = await apiRegister(creds);
      setUser(data.user); setToken(data.token);
      return data;
    } finally { setLoading(false); }
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    setUser(null); setToken(null);
    localStorage.removeItem("maison_token");
    localStorage.removeItem("maison_user");
    window.location.href = "/";
  };

  const isAdmin         = user?.role === "admin";
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user, token, loading, hydrated,
      login, register, logout,
      isAdmin, isAuthenticated, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
