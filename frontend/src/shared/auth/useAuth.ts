import { useAuthStore } from "@/shared/auth/authStore";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);

  const isAuthenticated = Boolean(
    token && expiresAt && new Date(expiresAt).getTime() > Date.now()
  );

  return { token, user, expiresAt, isAuthenticated, setSession, logout: clear };
}
