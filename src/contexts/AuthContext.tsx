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
} from "@/types";

interface AuthContextType {
  user: UserProfileResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthUserRequest) => Promise<void>;
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
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authApi.getProfile(userId);
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
      
      console.log("Auth response in context:", response);
      
      // Store token and user_id
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user_id", response.user_id);

      // Fetch user profile
      const profile = await authApi.getProfile(response.user_id);
      setUser(profile);
      setIsLoading(false);
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (data: CreateUserRequest) => {
    setIsLoading(true);
    try {
      // Register user
      await authApi.register(data);
      
      // Auto-login after registration
      await login({ email: data.email, password: data.password });
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    setUser(null);
    router.push("/");
  };

  const refreshUser = async () => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      const profile = await authApi.getProfile(userId);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
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
