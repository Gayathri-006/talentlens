import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/authService";
import { getToken, setToken } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (payload: { fullName: string; email: string; password: string; role: "candidate" | "recruiter" }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setSession: (token: string, user?: User) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await authService.me();
      setUser(u);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(
    async (payload: { fullName: string; email: string; password: string; role: "candidate" | "recruiter" }) => {
      const res = await authService.register(payload);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const setSession = useCallback(async (token: string, maybeUser?: User) => {
    setToken(token);
    if (maybeUser) {
      setUser(maybeUser);
      return maybeUser;
    }
    const u = await authService.me();
    setUser(u);
    return u;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refresh,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}