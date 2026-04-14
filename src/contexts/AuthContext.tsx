"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import type {
  UserProfileResponse,
  AuthUserRequest,
  CreateUserRequest,
  Verify2FARequest,
} from "@/types";

interface AuthContextType {
  user: UserProfileResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthUserRequest) => Promise<{ tempToken?: string; email?: string; completed?: boolean }>;
  verify2FA: (data: Verify2FARequest) => Promise<void>;
  register: (data: CreateUserRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Use /user/me to load current user by token
      const profile = await authApi.getMe();
      setUser(profile);
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (data: AuthUserRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);

      if (response.tempToken) {
        return { tempToken: response.tempToken, email: response.email, completed: false };
      }

      // Fallback for environments where /user/login returns final JWT directly.
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
        const profile = await authApi.getMe();
        setUser(profile);
        localStorage.setItem("user_id", profile.user_id);
        router.push("/dashboard");
        return { completed: true, email: response.email };
      }

      throw new Error(
        "Сервер не вернул ни временный токен 2FA, ни итоговый JWT. Проверьте /user/login."
      );
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (data: Verify2FARequest) => {
    setIsLoading(true);
    try {
      const { token } = await authApi.verify2FA(data);
      localStorage.setItem("auth_token", token);

      const profile = await authApi.getMe();
      setUser(profile);
      localStorage.setItem("user_id", profile.user_id);
      router.push("/dashboard");
    } catch (error) {
      console.error("2FA verification error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: CreateUserRequest) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      router.push("/login");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    setUser(null);
    router.push("/");
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const profile = await authApi.getMe();
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verify2FA,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
