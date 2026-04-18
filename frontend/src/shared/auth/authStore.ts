import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  email: string;
  displayName: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  expiresAt: string | null;
  user: AuthUser | null;
  setSession: (session: { token: string; expiresAt: string; user: AuthUser }) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      user: null,
      setSession: ({ token, expiresAt, user }) => set({ token, expiresAt, user }),
      clear: () => set({ token: null, expiresAt: null, user: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        if (!token || !expiresAt) return false;
        return new Date(expiresAt).getTime() > Date.now();
      },
    }),
    {
      name: "pizza-showcase-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
    }
  )
);
