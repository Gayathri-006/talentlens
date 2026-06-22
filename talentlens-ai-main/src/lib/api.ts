function normalizeApiUrl(raw: string): string {
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function resolveConfiguredApiUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl) {
    return normalizeApiUrl(envUrl);
  }

  // Local dev uses the Vite proxy (/api -> backend). Production must set VITE_API_URL.
  if (import.meta.env.DEV) {
    return "/api";
  }

  return "/api";
}

const API_URL = resolveConfiguredApiUrl();

export const TOKEN_KEY = "talentlens_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Body = Record<string, unknown> | FormData | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Body;
  signal?: AbortSignal;
  isForm?: boolean;
}

export function apiBaseUrl() {
  return API_URL;
}

/** Absolute API base URL (needed for OAuth redirects). */
export function resolveApiBaseUrl(): string {
  if (API_URL.startsWith("http")) return API_URL;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${API_URL}`;
  }
  return API_URL;
}

function missingProductionApiMessage(): string {
  return "Backend URL is not configured. Set VITE_API_URL to your Render backend URL (e.g. https://your-app.onrender.com) in Vercel environment variables, then redeploy.";
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal, isForm } = opts;

  if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL?.trim() && typeof window !== "undefined") {
    throw new ApiError(missingProductionApiMessage(), 0);
  }

  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let finalBody: BodyInit | undefined;
  if (body instanceof FormData) {
    finalBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }
  if (isForm && body instanceof FormData) {
    delete headers["Content-Type"];
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: finalBody,
      signal,
    });
  } catch (e) {
    const hint =
      import.meta.env.DEV
        ? "Start the backend with `npm run dev` in the backend folder."
        : missingProductionApiMessage();
    throw new ApiError(`Unable to reach the server. ${hint}`, 0, e);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (isJson && data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export const api = {
  get: <T,>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T,>(path: string, body?: Body, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...opts, method: "POST", body }),
  put: <T,>(path: string, body?: Body, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...opts, method: "PUT", body }),
  patch: <T,>(path: string, body?: Body, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", body }),
  del: <T,>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
