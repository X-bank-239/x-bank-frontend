const API_BASE_URL = "https://4c5450410f2f.vps.myjino.ru/api";



class ApiClient {
  private baseUrl: string;
  public lastResponseHeaders: Headers | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    console.log("Token from localStorage:", token);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    console.log("Request:", {
      method: options.method || "GET",
      url: `${this.baseUrl}${endpoint}`,
      headers,
      body: options.body,
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // Store headers for later access
    this.lastResponseHeaders = response.headers;

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Ошибка ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      console.error("Request Error:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      throw new Error(errorMessage);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      console.log("Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: {},
      });
      return {} as T;
    }
    
    const data = JSON.parse(text);
    console.log("Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: data,
    });
    return data;
  }

  getTokenFromHeaders(): string | null {
    if (!this.lastResponseHeaders) return null;
    
    // Try different header names
    const authHeader = this.lastResponseHeaders.get("Authorization");
    console.warn(authHeader);
    if (authHeader) {
      // Remove "Bearer " prefix if present
      // console.warn(authHeader);
      return authHeader.replace("Bearer ", "");
    }
    
    return null;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
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
