import { apiClient } from "./client";
import type {
  AuthUserRequest,
  CreateUserRequest,
  Verify2FARequest,
  UserProfileResponse,
} from "@/types";

interface AuthResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  tempToken?: string;
  temp_token?: string;
  email?: string;
  user_id?: string;
}

function pickToken(body: AuthResponse): string | null {
  const raw = body.token ?? body.access_token ?? body.accessToken;
  if (typeof raw !== "string") return null;
  return raw.trim().replace(/^Bearer\s+/i, "").trim() || null;
}

export const authApi = {
  /**
   * Login user with email and password
   */
  async login(
    data: AuthUserRequest
  ): Promise<{ token?: string; tempToken?: string; email?: string; user_id?: string }> {
    const authResponse = await apiClient.post<AuthResponse>(
      "/user/login",
      data
    );

    const tempToken = authResponse.tempToken ?? authResponse.temp_token;
    if (typeof tempToken === "string" && tempToken.trim()) {
      return {
        tempToken: tempToken.trim(),
        email: authResponse.email,
      };
    }

    const token = pickToken(authResponse);
    if (!token) {
      throw new Error("Токен не получен от сервера");
    }

    return { token, email: authResponse.email, user_id: authResponse.user_id };
  },

  async verify2FA(data: Verify2FARequest): Promise<{ token: string }> {
    const authResponse = await apiClient.post<AuthResponse>("/user/verify-2fa", data);
    const token = pickToken(authResponse);
    if (!token) {
      throw new Error("Токен не получен после подтверждения 2FA");
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
