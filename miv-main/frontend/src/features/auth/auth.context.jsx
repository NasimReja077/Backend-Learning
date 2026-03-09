import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState,
} from "react";
import api from "../../app/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data.data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    setUser(res.data.data?.user || null);
    return res.data;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post("/auth/register", payload);
    setUser(res.data.data?.user || null);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await api.get("/auth/me");
    const u = res.data.data?.user || null;
    setUser(u);
    return u;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
