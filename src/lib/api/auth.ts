import { apiClient } from "./client";
import type {
  AuthUserRequest,
  CreateUserRequest,
  LoginInitResponse,
  Verify2FARequest,
  UserProfileResponse,
} from "@/types";

interface AuthResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
}

function pickToken(body: AuthResponse): string | null {
  const raw = body.token ?? body.access_token ?? body.accessToken;
  if (typeof raw !== "string") return null;
  return raw.trim().replace(/^Bearer\s+/i, "").trim() || null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string") {
      const t = v.trim();
      if (t) return t;
    }
  }
  return undefined;
}

/** Разные варианты JSON от бэкенда для шага 1 логина (2FA). */
function normalizeLoginInitResponse(raw: unknown): LoginInitResponse & { token?: string } {
  const root = asRecord(raw) ?? {};
  const nested = asRecord(root.data) ?? asRecord(root.payload) ?? {};
  const merged: Record<string, unknown> = { ...root, ...nested };

  const tempToken = pickString(merged, [
    "tempToken",
    "temp_token",
    "temp-token",
    "temporaryToken",
    "temporary_token",
    "temp",
  ]);

  const requires2faRaw =
    merged.requires2fa ?? merged.requires2FA ?? merged.requires_2fa ?? merged.twoFactorRequired;
  let requires2fa: boolean;
  if (typeof requires2faRaw === "boolean") {
    requires2fa = requires2faRaw;
  } else if (typeof requires2faRaw === "string") {
    requires2fa = requires2faRaw.trim().toLowerCase() === "true";
  } else {
    requires2fa = Boolean(tempToken);
  }

  const email = pickString(merged, ["email", "userEmail", "user_email"]);
  const token = pickString(merged, ["token", "access_token", "accessToken", "jwt"]);

  return {
    requires2fa: requires2fa || Boolean(tempToken),
    tempToken,
    email,
    token,
  };
}

export const authApi = {
  /**
   * Start login flow (email+password). Returns temp token for 2FA step.
   */
  async login(data: AuthUserRequest): Promise<LoginInitResponse & { token?: string }> {
    const raw = await apiClient.post<unknown>("/user/login", data);
    return normalizeLoginInitResponse(raw);
  },

  /**
   * Verify 2FA code and return final JWT token.
   */
  async verify2FA(data: Verify2FARequest): Promise<{ token: string }> {
    const authResponse = await apiClient.post<AuthResponse>("/user/login/2fa", data);
    const token = pickToken(authResponse);
    if (!token) {
      throw new Error("Токен не получен от сервера");
    }
    return { token };
  },

  /**
   * Register a new user
   */
  async register(data: CreateUserRequest): Promise<UserProfileResponse> {
    return apiClient.post<UserProfileResponse>("/user/create", data);
  },

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfileResponse> {
    // OpenAPI: GET /user/{userId}
    return apiClient.get<UserProfileResponse>(`/user/${userId}`);
  },

  /**
   * Get user profile by email
   */
  async getProfileByEmail(email: string): Promise<UserProfileResponse> {
    // OpenAPI: GET /user/email/{email}
    return apiClient.get<UserProfileResponse>(`/user/email/${email}`);
  },

  /**
   * Get current authenticated user profile
   * OpenAPI: GET /user/me
   */
  async getMe(): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>("/user/me");
  },
};
