import { createContext, useContext, useState, useEffect, useRef } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read from localStorage synchronously on first render
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("maison_user")) || null; }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("maison_token") || null);

  // hydrated = we have confirmed what the auth state is (either from cache or API)
  // Start as false — only flip to true once we know for certain
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading]   = useState(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    // Only run once
    if (didHydrate.current) return;
    didHydrate.current = true;

    const storedToken = localStorage.getItem("maison_token");
    const storedUser  = (() => {
      try { return JSON.parse(localStorage.getItem("maison_user")); } catch { return null; }
    })();

    if (!storedToken) {
      // No token at all — user is not logged in
      setHydrated(true);
      return;
    }

    if (storedUser && storedUser.role) {
      // We have a full user object with role — no need for API call
      // Trust localStorage until next explicit action (login/logout)
      setUser(storedUser);
      setToken(storedToken);
      setHydrated(true);
      return;
    }

    // Token exists but no user data — must fetch from API
    getMe()
      .then(d => {
        if (d?.user) {
          setUser(d.user);
          setToken(storedToken);
          localStorage.setItem("maison_user", JSON.stringify(d.user));
        } else {
          // API returned but no user — treat as logged out
          localStorage.removeItem("maison_token");
          localStorage.removeItem("maison_user");
          setUser(null);
          setToken(null);
        }
      })
      .catch(() => {
        // API offline or token invalid — clear everything
        localStorage.removeItem("maison_token");
        localStorage.removeItem("maison_user");
        setUser(null);
        setToken(null);
      })
      .finally(() => setHydrated(true));
  }, []);

  const login = async (creds) => {
    setLoading(true);
    try {
      const data = await apiLogin(creds);
      // apiLogin already writes to localStorage
      setUser(data.user);
      setToken(data.token);
      setHydrated(true);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (creds) => {
    setLoading(true);
    try {
      const data = await apiRegister(creds);
      setUser(data.user);
      setToken(data.token);
      setHydrated(true);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem("maison_token");
    localStorage.removeItem("maison_user");
    window.location.href = "/";
  };

  // Refresh user from API (called after role change etc.)
  const refreshUser = async () => {
    try {
      const d = await getMe();
      if (d?.user) {
        setUser(d.user);
        localStorage.setItem("maison_user", JSON.stringify(d.user));
      }
    } catch {}
  };

  const isAdmin         = user?.role === "admin";
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user, token, loading, hydrated,
      login, register, logout, refreshUser,
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
