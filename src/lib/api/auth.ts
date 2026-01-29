import { apiClient } from "./client";
import type {
  AuthUserRequest,
  CreateUserRequest,
  UserProfileResponse,
} from "@/types";

interface AuthResponse {
  token: string;
}

export const authApi = {
  /**
   * Login user with email and password
   */
  async login(
    data: AuthUserRequest
  ): Promise<{ token: string; user_id: string }> {
    const authResponse = await apiClient.post<AuthResponse>(
      "/user/login",
      data
    );

    const token = authResponse.token;
    console.log(token);
    if (!token) {
      throw new Error("Токен не получен от сервера");
    }

    // Manually set token for the next request
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }

    // After login, get profile by email to get user_id
    const userProfile = await this.getProfileByEmail(data.email);

    if (!userProfile.user_id) {
      throw new Error("ID пользователя не получен от сервера");
    }

    return { token, user_id: userProfile.user_id };
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
    return apiClient.get<UserProfileResponse>(`/user/get-profile/${userId}`);
  },

  /**
   * Get user profile by email
   */
  async getProfileByEmail(email: string): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>(`/user/get-profile/email/${email}`);
  },
};
