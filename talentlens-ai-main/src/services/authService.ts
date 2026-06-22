import { api, resolveApiBaseUrl, setToken } from "@/lib/api";
import type { User } from "@/lib/types";

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  register: (payload: { fullName: string; email: string; password: string; role: "candidate" | "recruiter" }) =>
    api.post<AuthResponse>("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", payload),
  me: () => api.get<User>("/auth/me"),
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setToken(null);
    }
  },
  googleAuthUrl: () => `${resolveApiBaseUrl()}/auth/google`,
};