"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, TOKEN_KEY, type UserResponse } from "@/lib/api";

interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    ageVerified: boolean;
  }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of persisted session on mount
      setLoading(false);
      return;
    }

    setToken(stored);
    api
      .me(stored)
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    window.localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; ageVerified: boolean }) => {
      const res = await api.register(data);
      window.localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setUser(await api.me(token));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
      }
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
