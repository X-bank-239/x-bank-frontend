import { getApiBaseUrl } from "@/lib/api-base-url";

/** JWT без префикса Bearer (как в заголовке Authorization) */
function normalizeStoredToken(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim().replace(/^Bearer\s+/i, "").trim();
  return t || null;
}

const API_BASE_URL = getApiBaseUrl();

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

    const headers = new Headers(options.headers as HeadersInit | undefined);
    const body = options.body;
    const hasJsonBody = typeof body === "string" && body.length > 0;
    if (!headers.has("Content-Type") && hasJsonBody) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const method = (options.method ?? "GET").toUpperCase();
    const isLoginAttempt = endpoint === "/user/login" && method === "POST";

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (e) {
      console.error("Сетевая ошибка:", { endpoint, method, error: e });
      throw new Error(
        "Не удалось подключиться к серверу. Проверьте интернет или попробуйте позже."
      );
    }

    this.lastResponseHeaders = response.headers;

    if (!response.ok) {
      let errorMessage: string;
      const errorText = await response.text();
      switch (response.status) {
        case 401:
          errorMessage = isLoginAttempt
            ? "Ошибка: неверный email или пароль"
            : "Сессия истекла или токен недействителен. Войдите снова.";
          break;
        case 400:
          errorMessage = "Некорректный запрос. Проверьте введённые данные.";
          break;
        case 403:
          errorMessage = "Недостаточно прав для выполнения операции.";
          break;
        case 404:
          errorMessage = "Ресурс не найден.";
          break;
        case 409:
          errorMessage = "Конфликт данных. Обновите страницу и попробуйте снова.";
          break;
        case 429:
          errorMessage = "Слишком много запросов. Подождите и повторите попытку.";
          break;
        default:
          errorMessage =
            response.status >= 500
              ? "Ошибка сервера. Попробуйте позже."
              : `Ошибка ${response.status}`;
      }

      try {
        const errorJson = JSON.parse(errorText);
        // Если бэкенд присылает русское сообщение — показываем его.
        if (typeof errorJson?.message === "string" && errorJson.message.trim()) {
          errorMessage = errorJson.message;
        }
      } catch {
        if (errorText) {
          // Иногда сервер присылает plain-text ответ. Не показываем HTML/технический мусор.
          const cleaned = errorText.trim();
          if (cleaned && !cleaned.startsWith("<!doctype") && !cleaned.startsWith("<html")) {
            errorMessage = cleaned;
          }
        }
      }

      console.error("Ошибка запроса:", {
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

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
