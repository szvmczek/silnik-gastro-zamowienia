import { apiClient } from "@/shared/api/client";
import type { AuthUser } from "@/shared/auth/authStore";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
  return response.data;
}
