"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserSession, getSession, setSession, clearSession } from "@/lib/auth-client";

interface AuthContextValue {
  user: UserSession | null;
  loading: boolean;
  login: (session: UserSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setUser(getSession());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("quiniela-auth", refresh);
    return () => window.removeEventListener("quiniela-auth", refresh);
  }, [refresh]);

  const login = useCallback((session: UserSession) => {
    setSession(session);
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
