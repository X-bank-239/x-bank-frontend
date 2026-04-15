const DEFAULT_API_BASE_URL = "https://4c5450410f2f.vps.myjino.ru/api";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** JWT без префикса Bearer (как в заголовке Authorization) */
function normalizeStoredToken(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim().replace(/^Bearer\s+/i, "").trim();
  return t || null;
}

const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
);

class ApiClient {
  private baseUrl: string;
  public lastResponseHeaders: Headers | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return normalizeStoredToken(localStorage.getItem("auth_token"));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const method = (options.method ?? "GET").toUpperCase();
    const isLoginAttempt = endpoint === "/user/login" && method === "POST";

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    this.lastResponseHeaders = response.headers;

    if (!response.ok) {
      let errorMessage: string;
      const errorText = await response.text();
      switch (response.status) {
        case 401:
          errorMessage = isLoginAttempt
            ? "Ошибка: неверный логин или пароль"
            : "Сессия истекла или токен недействителен. Войдите снова.";
          break;
        default:
          errorMessage = `Ошибка ${response.status}`;
      }

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        if (errorText) {
          errorMessage = errorText;
        }
      }

      console.error("Request Error:", {
        endpoint,
        method,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    const data = JSON.parse(text);

    return data;
  }

  getTokenFromHeaders(): string | null {
    if (!this.lastResponseHeaders) return null;

    const authHeader = this.lastResponseHeaders.get("Authorization");
    if (authHeader) {
      return authHeader.replace(/^Bearer\s+/i, "").trim();
    }

    return null;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
